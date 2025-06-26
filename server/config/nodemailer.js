import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// PRINT FULL .env CONTENT FOR DEBUGGING
console.log("ENV CHECK:", {
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
});

// If any are missing, crash early
if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  throw new Error("❌ SMTP_USER or SMTP_PASS missing from environment variables!");
}

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify((err, success) => {
  if (err) {
    console.error("❌ SMTP connection error:", err);
  } else {
    console.log("✅ SMTP connection successful");
  }
});

export default transporter;
