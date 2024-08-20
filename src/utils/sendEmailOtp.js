import nodemailer from "nodemailer"
const sendEmailOtp = async (options) => {
  const transporter = nodemailer.createTransport({
    // service:gmail,
    host: process.env.SMPT_HOST,
    port: process.env.SMPT_PORT,
    secure: true, // Use SSL
    auth: {
      user: process.env.SMPT_MAIL,
      pass: process.env.SMPT_APP_PASS,
    },
    authMethod: "LOGIN", // Specify the authentication method
  });

  // const mailOptions = {
  //     from: process.env.FROM_EMAIL,
  //     to: options.to,
  //     subject: options.subject,
  //     html: options.message,
  // };
  const mailOptions = {
    from: process.env.SMPT_HOST,
    to: options.to,
    subject: options.subject,
    html: options.message,
  };

  await transporter.sendMail(mailOptions);
};

export default  sendEmailOtp;
