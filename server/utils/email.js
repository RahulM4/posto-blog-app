const nodemailer = require('nodemailer');
const config = require('../config/env');

let transporter;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.email.smtp.host,
      port: config.email.smtp.port,
      secure: false,
      auth: config.email.smtp.auth.user
        ? {
            user: config.email.smtp.auth.user,
            pass: config.email.smtp.auth.pass
          }
        : undefined
    });
  }
  return transporter;
};

const sendMail = async ({ to, subject, html, text }) => {
  const tx = getTransporter();
  await tx.sendMail({
    from: config.email.from,
    to,
    subject,
    html,
    text
  });
};

const buildResetEmail = (token) => {
  const resetUrl = `${config.clientUrl}/auth/reset-password?token=${token}`;
  return {
    subject: `${config.appName} password reset`,
    html: `<p>You requested a password reset.</p><p><a href="${resetUrl}" target="_blank" rel="noopener noreferrer">Reset your password</a></p><p>If you did not request this, ignore the message.</p>`,
    text: `Reset your password: ${resetUrl}`
  };
};

const buildVerificationEmail = (token) => {
  const verificationUrl = `${config.clientUrl}/verify-email?token=${token}`;
  return {
    subject: `${config.appName} — verify your email`,
    html: `<p>Welcome to ${config.appName}!</p><p><a href="${verificationUrl}" target="_blank" rel="noopener noreferrer">Click here to verify your email address</a>.</p><p>If you did not create an account, you can ignore this email.</p>`,
    text: `Verify your email address: ${verificationUrl}`
  };
};

module.exports = {
  sendMail,
  buildResetEmail,
  buildVerificationEmail
};
