import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.Mailer_User,
    pass: process.env.Mailer_Pass,
  },
});

const sendMail = (email, subject, message) => {
  return new Promise((resolve, reject) => {
    const mailOptions = {
      from: process.env.Mailer_User,
      to: email,
      subject: subject,
      text: message,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return reject(error);
      }
      console.log("Email sent: " + info.response);
      resolve(info);
    });
  });
};

export default sendMail;
