import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

let transporter;

if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
} else {
  // Mock transporter for local dev without smtp credentials
  transporter = {
    sendMail: async (options) => {
      console.log('📧 [DEV EMAIL MOCK] Sending email:');
      console.log(`   To: ${options.to}`);
      console.log(`   Subject: ${options.subject}`);
      console.log(`   Preview: ${options.text || options.html?.slice(0, 100)}...`);
      return { messageId: `mock-${Date.now()}` };
    }
  };
}

export default transporter;
