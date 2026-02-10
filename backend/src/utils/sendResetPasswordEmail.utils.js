import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendResetPasswordEmail = async (email, resetUrl) => {
  await transporter.sendMail({
    from: `"InstantBook" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset your password",
    html: `
      <h2>Password Reset</h2>
      <p>Click the button below to reset your password:</p>
      <a href="${resetUrl}" 
         style="padding:10px 20px;background:#4f46e5;color:white;border-radius:6px;text-decoration:none">
        Reset Password
      </a>
      <p>This link expires in 15 minutes.</p>
    `,
  });
};
