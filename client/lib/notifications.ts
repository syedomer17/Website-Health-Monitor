import nodemailer from "nodemailer";
import twilio from "twilio";

// Email configuration
const getEmailTransporter = () => {
  // You can configure this via environment variables
  const email = process.env.EMAIL_USER;
  const password = process.env.EMAIL_PASSWORD;
  const host = process.env.EMAIL_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.EMAIL_PORT || "587");

  if (!email || !password) {
    console.warn(
      "Email credentials not configured. Email notifications will be disabled."
    );
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user: email,
      pass: password,
    },
  });
};

// Twilio configuration
const getTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.warn(
      "Twilio credentials not configured. SMS notifications will be disabled."
    );
    return null;
  }

  return twilio(accountSid, authToken);
};

// Send email notification
export async function sendEmailNotification(
  websiteName: string,
  url: string,
  statusCode: number,
  timestamp: string
): Promise<boolean> {
  try {
    const transporter = getEmailTransporter();
    if (!transporter) return false;

    const toEmail = process.env.NOTIFICATION_EMAIL || process.env.EMAIL_USER;
    if (!toEmail) {
      console.warn("No recipient email configured");
      return false;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: `⚠️ Website Down Alert: ${websiteName}`,
      html: `
        <h2>Website Health Monitor Alert</h2>
        <p><strong>Website Name:</strong> ${websiteName}</p>
        <p><strong>URL:</strong> ${url}</p>
        <p><strong>Status Code:</strong> ${statusCode}</p>
        <p><strong>Time:</strong> ${new Date(timestamp).toLocaleString()}</p>
        <p><strong>Status:</strong> <span style="color: red;">UNHEALTHY</span></p>
        <p>The website is not responding with a healthy status code (200 or 201).</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email notification sent for ${websiteName}`);
    return true;
  } catch (error) {
    console.error("Failed to send email notification:", error);
    return false;
  }
}

// Send SMS notification via Twilio
export async function sendSMSNotification(
  websiteName: string,
  url: string,
  statusCode: number,
  timestamp: string
): Promise<boolean> {
  try {
    const client = getTwilioClient();
    if (!client) return false;

    // const toNumber = process.env.NOTIFICATION_PHONE;
    // if (!toNumber) {
    //   console.warn('No recipient phone number configured');
    //   return false;
    // }

    const fromNumber = process.env.TWILIO_PHONE_NUMBER!;
    const message = `⚠️ Website Down Alert: ${websiteName}\nURL: ${url}\nStatus Code: ${statusCode}\nTime: ${new Date(
      timestamp
    ).toLocaleString()}`;

    const recipients = ["+919618211626", "+919701889473"];

    await Promise.all(
      recipients.map((to) =>
        client.messages.create({
          body: message,
          from: fromNumber,
          to,
        })
      )
    );

    console.log(`SMS notification sent for ${websiteName}`);
    return true;
  } catch (error) {
    console.error("Failed to send SMS notification:", error);
    return false;
  }
}

// Send both email and SMS notifications
export async function sendNotifications(
  websiteName: string,
  url: string,
  statusCode: number,
  timestamp: string
): Promise<void> {
  // Send both notifications in parallel
  await Promise.all([
    sendEmailNotification(websiteName, url, statusCode, timestamp),
    sendSMSNotification(websiteName, url, statusCode, timestamp),
  ]);
}
