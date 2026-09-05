import nodemailer from "nodemailer";

const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_APP_PASSWORD;

  if (!emailUser || !emailPassword) {
    throw new Error(
      "EMAIL_USER or EMAIL_APP_PASSWORD is missing from the environment variables",
    );
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,

    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  });
};

const escapeHtml = (value = "") => {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

export const sendPasswordResetOtp = async ({
  recipientEmail,
  recipientName,
  otp,
}) => {
  const transporter = createTransporter();

  const safeName = escapeHtml(recipientName || "User");
  const safeOtp = escapeHtml(otp);

  const mailOptions = {
    from: {
      name: "ResolveAI Support",
      address: process.env.EMAIL_USER,
    },

    to: recipientEmail,

    subject: "ResolveAI password reset OTP",

    text: `
Hello ${recipientName || "User"},

Your ResolveAI password reset OTP is: ${otp}

This OTP will expire in 10 minutes.

If you did not request a password reset, you can ignore this email.

ResolveAI Support
    `.trim(),

    html: `
      <div
        style="
          margin: 0;
          padding: 30px 15px;
          background-color: #f1f5f9;
          font-family: Arial, Helvetica, sans-serif;
          color: #0f172a;
        "
      >
        <div
          style="
            max-width: 560px;
            margin: 0 auto;
            overflow: hidden;
            border: 1px solid #e2e8f0;
            border-radius: 20px;
            background-color: #ffffff;
          "
        >
          <div
            style="
              padding: 24px 30px;
              background-color: #047857;
              color: #ffffff;
            "
          >
            <h1
              style="
                margin: 0;
                font-size: 24px;
                line-height: 1.3;
              "
            >
              ResolveAI
            </h1>

            <p
              style="
                margin: 6px 0 0;
                color: #d1fae5;
                font-size: 14px;
              "
            >
              Smart Complaint Management System
            </p>
          </div>

          <div style="padding: 30px">
            <h2
              style="
                margin: 0 0 15px;
                font-size: 21px;
                color: #0f172a;
              "
            >
              Password reset request
            </h2>

            <p
              style="
                margin: 0 0 16px;
                color: #475569;
                font-size: 15px;
                line-height: 1.7;
              "
            >
              Hello ${safeName},
            </p>

            <p
              style="
                margin: 0 0 22px;
                color: #475569;
                font-size: 15px;
                line-height: 1.7;
              "
            >
              Enter the following OTP in ResolveAI to continue resetting
              your password.
            </p>

            <div
              style="
                margin: 0 0 22px;
                padding: 20px;
                border: 1px solid #a7f3d0;
                border-radius: 14px;
                background-color: #ecfdf5;
                text-align: center;
              "
            >
              <p
                style="
                  margin: 0 0 8px;
                  color: #047857;
                  font-size: 12px;
                  font-weight: bold;
                  letter-spacing: 1px;
                  text-transform: uppercase;
                "
              >
                Verification code
              </p>

              <p
                style="
                  margin: 0;
                  color: #065f46;
                  font-size: 34px;
                  font-weight: bold;
                  letter-spacing: 8px;
                "
              >
                ${safeOtp}
              </p>
            </div>

            <p
              style="
                margin: 0 0 10px;
                color: #475569;
                font-size: 14px;
                line-height: 1.6;
              "
            >
              This OTP will expire in
              <strong>10 minutes</strong>.
            </p>

            <p
              style="
                margin: 0;
                color: #64748b;
                font-size: 13px;
                line-height: 1.6;
              "
            >
              If you did not request this password reset, ignore this
              email. Do not share this code with anyone.
            </p>
          </div>

          <div
            style="
              border-top: 1px solid #e2e8f0;
              padding: 18px 30px;
              background-color: #f8fafc;
              color: #94a3b8;
              font-size: 12px;
              text-align: center;
            "
          >
            This is an automated email from ResolveAI Support.
          </div>
        </div>
      </div>
    `,
  };

  const information = await transporter.sendMail(mailOptions);

  return {
    messageId: information.messageId,
    accepted: information.accepted,
    rejected: information.rejected,
  };
};

export const verifyEmailConnection = async () => {
  const transporter = createTransporter();
  await transporter.verify();

  return true;
};
