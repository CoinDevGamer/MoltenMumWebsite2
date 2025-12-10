import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

const SALES_EMAIL = process.env.SALES_EMAIL || "izhanbhatti104@gmail.com";

// ✅ Debug check — log when email.js loads
console.log("📧 Loaded SMTP_USER:", process.env.SMTP_USER);
console.log("📧 Loaded SMTP_PASS:", process.env.SMTP_PASS ? "[LOADED]" : "❌ NOT LOADED");

// ✅ Create the transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 587),
  secure: false, // must be false for Gmail with port 587
  auth: {
    user: process.env.SMTP_USER?.trim(),
    pass: process.env.SMTP_PASS?.trim(),
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export async function sendMail({ subject, html, to }) {
  const recipient = to || SALES_EMAIL;

  // 📤 Debug log before sending
  console.log("📤 Trying to send mail with:", {
    user: process.env.SMTP_USER,
    passLength: process.env.SMTP_PASS?.length,
  });

  return transporter.sendMail({
    from: `"Pet Market" <${process.env.SMTP_USER}>`,
    to: recipient,
    subject,
    html,
  });
}
