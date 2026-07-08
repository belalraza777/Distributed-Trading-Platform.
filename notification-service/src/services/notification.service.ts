import prisma from '../config/db';
import { sendEmail } from '../workers/email.worker';
import { sendSMS } from '../workers/sms.worker';

interface NotificationParams {
  userId: number;
  email: string;
  phone: string;
  title: string;
  message: string;
}

// saves notification to DB then sends via email + SMS
export async function notify({ userId, email, phone, title, message }: NotificationParams) {
  // persist first — so notification exists even if email/SMS fails
  await prisma.notification.create({
    data: { user_id: userId, title, message },
  });

  if (email) await sendEmail(email, title, message);
  if (phone) await sendSMS(phone, message);
}