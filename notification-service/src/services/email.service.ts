// MVP: logs to console
// Phase 2: npm install nodemailer + add SMTP credentials in .env

import { SendResult } from "../types/notifi";

export async function sendEmail(to: string, subject: string, body: string): Promise<SendResult> {
  try {
    // const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
    // await transporter.sendMail({ from: process.env.SMTP_FROM, to, subject, text: body });
    console.log(`[Email] To: ${to} | Subject: ${subject} | Body: ${body}`);
    return { success: true };
  } catch (error) {
    console.error(`[Email] Error sending to ${to}:`, error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
