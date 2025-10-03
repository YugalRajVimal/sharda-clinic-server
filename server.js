import "dotenv/config";
import express from "express";
import nodemailer from "nodemailer";

import cors from "cors";
import bodyParser from "body-parser";
import router from "./routes.js";
import { connectUsingMongoose } from "./config/mongoose.config.js";

const app = express();

const allowedOrigins = [
  "https://sharda-clinics.onrender.com", // React frontend
  "http://localhost:5173", // local dev
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // only if you need cookies
};

app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("Welcome to Shardha Clinic App Server");
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.Mailer_User,
    pass: process.env.Mailer_Pass,
  },
});

app.post("/send-mail", (req, res) => {
  const {
    fullName,
    email,
    message,
    countryCode,
    phone,
  } = req.body;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <div style="background-color: #f10000; padding: 15px; text-align: center; color: white;">
          <h2>📩 New Contact Submission</h2>
        </div>
        <div style="padding: 20px; color: #333;">
          <p style="font-size: 16px;">You have received a new contact request.</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td><strong>Full Name:</strong></td><td>${fullName}</td></tr>
            <tr><td><strong>Email:</strong></td><td>${email}</td></tr>
            <tr><td><strong>Phone:</strong></td><td>${countryCode} ${phone}</td></tr>
            <tr><td><strong>Message:</strong></td><td>${message}</td></tr>
          </table>
        </div>
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #888;">
          Sent from Sharda Clinic Website
        </div>
      </div>
    </div>
  `;

  const confirmationHtml = `
    <div style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <div style="background-color: #f10000; padding: 15px; text-align: center; color: white;">
          <h2>✅ Message Received</h2>
        </div>
        <div style="padding: 20px; color: #333;">
          <p>Hi ${fullName},</p>
          <p>Thank you for reaching out to Sharda Clinic. We have received your message and will get back to you shortly.</p>
          <blockquote style="border-left: 3px solid #f10000; padding-left: 10px; color: #555;">
            ${message}
          </blockquote>
          <p style="margin-top: 20px;">Warm regards,<br/>Sharda Clinic</p>
        </div>
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #888;">
          This is an automated email. Please do not reply directly.
        </div>
      </div>
    </div>
  `;

  const mailOptions = {
    from: process.env.Mailer_User,
    to: process.env.Send_Mailer_User,
    subject: `${fullName} submitted a Contact Form`,
    html: htmlContent,
  };

  const mailOptions2 = {
    from: process.env.Mailer_User,
    to: email,
    subject: `Thanks for contacting Sharda Clinic, ${fullName}`,
    html: confirmationHtml,
  };

  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      console.error("Admin email error:", error);
      return res.status(500).send("Error sending admin email.");
    }
    transporter.sendMail(mailOptions2, (error) => {
      if (error) {
        console.error("User confirmation email error:", error);
        return res.status(500).send("Error sending confirmation email.");
      }
      res.status(200).send("Emails sent successfully.");
    });
  });
});

app.use("/Uploads/Videos", express.static("Uploads/Videos"));
app.use("/Uploads/Images", express.static("Uploads/Images"));

app.use("/api", router);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
  connectUsingMongoose();
});
