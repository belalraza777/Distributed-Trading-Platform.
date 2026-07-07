import prisma from '../config/db';
import { sendEmail } from '../workers/email.worker';
import { sendSMS } from '../workers/sms.worker';

// saves notification to DB then sends via email + SMS
export async function notify(
  userId: number,
  email: string,
  phone: string,
  title: string,
  message: string
) {
  // persist first — so notification exists even if email/SMS fails
  await prisma.notification.create({
    data: { user_id: userId, title, message },
  });

  await sendEmail(email, title, message);
  await sendSMS(phone, message);
}