// Sends real emails using Nodemailer + Gmail.

require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  family: 4 // forces IPv4 - works around a known Render networking issue
});

async function sendOtpEmail(toEmail, name, otp) {
  const fromName = process.env.EMAIL_FROM_NAME || 'Babutheni';
  return transporter.sendMail({
    from: `"${fromName}" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Your Babutheni verification code',
    text: `Hi ${name || ''},\n\nYour verification code is: ${otp}\n\nThis code expires in 10 minutes. If you did not request this, you can ignore this email.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#0f0f11;color:#fafafa;border-radius:12px">
        <h2 style="color:#fb7185;margin-top:0">Verify your email</h2>
        <p>Hi ${name || 'there'},</p>
        <p>Use the code below to verify your Babutheni account. It expires in 10 minutes.</p>
        <div style="font-size:28px;font-weight:700;letter-spacing:6px;background:#18181b;padding:16px;text-align:center;border-radius:8px;margin:16px 0">${otp}</div>
        <p style="color:#a1a1aa;font-size:13px">If you did not request this code, you can safely ignore this email.</p>
      </div>
    `
  });
}

async function sendContactNotification(toEmail, ownerName, senderName, senderEmail, message) {
  const fromName = process.env.EMAIL_FROM_NAME || 'Babutheni';
  return transporter.sendMail({
    from: `"${fromName}" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    replyTo: `"${senderName}" <${senderEmail}>`,
    subject: `New message from ${senderName} via your Babutheni portfolio`,
    text: `You have a new message from ${senderName} (${senderEmail}):\n\n${message}\n\nReply directly to this email to respond to them.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#0f0f11;color:#fafafa;border-radius:12px">
        <h2 style="color:#fb7185;margin-top:0">New portfolio message</h2>
        <p><strong>${senderName}</strong> (${senderEmail}) sent you a message:</p>
        <div style="background:#18181b;padding:16px;border-radius:8px;margin:16px 0;white-space:pre-wrap">${message}</div>
        <p style="color:#a1a1aa;font-size:13px">Reply directly to this email to respond to them.</p>
      </div>
    `
  });
}

module.exports = { sendOtpEmail, sendContactNotification };
