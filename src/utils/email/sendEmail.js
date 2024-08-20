

import nodemailer from "nodemailer";
import handlebars from "handlebars";
import fs from "fs";
import path from "path";

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sendEmail = async (email, subject, payload, template) => {
  try {
    console.log("Creating transporter...");
    // Create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: 587,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    console.log("Reading template...");
    const source = fs.readFileSync(path.join(__dirname, template), "utf8");
    const compiledTemplate = handlebars.compile(source);

    const options = {
      from: process.env.FROM_EMAIL,
      to: email,
      subject: subject,
      html: compiledTemplate(payload),
    };

    console.log("Sending email...");
    const info = await transporter.sendMail(options);
    console.log(`Email sent to ${email}: ${info.response}`);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export default sendEmail;

