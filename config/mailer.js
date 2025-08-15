import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (toMail, subject, body, testReport) => {
  const info = await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to: toMail,
    subject: subject,
    html: body,
    attachments: [
      {
        filename: testReport.filename,
        content: testReport.content, // Ensure this is a Buffer
        contentType: testReport.contentType,
      },
    ],
  });

  console.log("Email sent:", info);
};
