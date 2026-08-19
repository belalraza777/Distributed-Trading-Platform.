import { NotificationStatus } from "@prisma/client"
import prisma from "../config/db"
import { publishToQueue } from "../config/rabbit"
import { sendEmail } from "./email.service"
import { sendSMS } from "./sms.service"

const MAX_RETRIES = 3

interface NotifyParams {
  userId: number
  email?: string
  phone?: string
  title: string
  message: string
}

// Create notification and deliver it
// If delivery fails, mark as failed and queue for retry
export async function notify(params: NotifyParams) {
  const notification = await prisma.notification.create({
    data: {
      user_id: params.userId,
      title: params.title,
      message: params.message,
      status: NotificationStatus.PENDING,
    },
  })

  await deliver(notification.id, 0, params)
}

// Retry a failed notification
// If max retries reached, mark as failed and do not retry
export async function retryNotification(params: NotifyParams & { notificationId: number }) {
  const notification = await prisma.notification.findUnique({
    where: { id: params.notificationId },
    select: { retry_count: true },
  })

  if (!notification) return

  await deliver(params.notificationId, notification.retry_count, params)
}

// Send via email + SMS, mark status, queue retry if failed
// If max retries reached, mark as failed and do not retry
async function deliver(id: number, retryCount: number, params: NotifyParams) {
  const { email, phone, title, message } = params

  let failed = false

  // Try sending email and SMS in parallel, if either fails, mark as failed
  try {
    await Promise.all([
      email ? sendEmail(email, title, message) : Promise.resolve(),
      phone ? sendSMS(phone, message)          : Promise.resolve(),
    ])
  } catch (err) {
    failed = true
    await prisma.notification.update({
      where: { id },
      data: { status: NotificationStatus.FAILED, error: String(err) },
    })
  }

  if (!failed) {
    await prisma.notification.update({
      where: { id },
      data: { status: NotificationStatus.SENT, sent_at: new Date(), error: null },
    })
    return
  }

  // If failed, increment retry count and queue for retry
  if (retryCount >= MAX_RETRIES) {
    console.error(`[Notification] Max retries reached for ${id}`)
    return
  }

  await prisma.notification.update({
    where: { id },
    data: { retry_count: { increment: 1 } },
  })

  await publishToQueue("notification.retry", { notificationId: id, ...params })
  console.log(`[Notification] Retry queued for ${id} (${retryCount + 1}/${MAX_RETRIES})`)
}