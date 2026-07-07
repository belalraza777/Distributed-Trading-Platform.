// MVP: logs to console
// Phase 2: npm install twilio + add TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN in .env

export async function sendSMS(to: string, body: string) {
  // const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  // await twilio.messages.create({ from: process.env.TWILIO_PHONE, to, body });
  console.log(`[SMS] To: ${to} | Body: ${body}`);
}