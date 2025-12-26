import nodemailer from "nodemailer";
import twilio from "twilio";

/* =========================
   EMAIL TRANSPORTER
========================= */
async function getEmailTransporter() {
  const { EMAIL_USER, EMAIL_PASSWORD } = process.env;

  if (!EMAIL_USER || !EMAIL_PASSWORD) {
    console.warn("❌ EMAIL_USER or EMAIL_PASSWORD missing");
    return null;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD, // Gmail App Password ONLY
    },
  });

  try {
    await transporter.verify();
    console.log("✅ Email transporter verified");
    return transporter;
  } catch (err) {
    console.error("❌ Email transporter failed:", err);
    return null;
  }
}

/* =========================
   TWILIO CLIENT
========================= */
function getTwilioClient() {
  const {
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER,
  } = process.env;

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    console.warn("❌ Twilio env vars missing");
    return null;
  }

  return twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}

/* =========================
   EMAIL: WEBSITE DOWN
========================= */
export async function sendEmailNotificationDown(
  websiteName: string,
  url: string,
  statusCode: number,
  timestamp: string
): Promise<boolean> {
  const transporter = await getEmailTransporter();
  if (!transporter) return false;

  const recipients = [
    "syedomerali2006@gmail.com",
    "suhailroushan13@gmail.com",
    "sami@codeforindia.com",
  ];

  try {
    await transporter.sendMail({
      from: `"Health Monitor" <${process.env.EMAIL_USER}>`,
      to: recipients.join(","), // IMPORTANT
      subject: `⚠️ Website DOWN: ${websiteName}`,
      html: `
        <h2>Website Down Alert</h2>
        <p><b>Website:</b> ${websiteName}</p>
        <p><b>URL:</b> ${url}</p>
        <p><b>Status Code:</b> ${statusCode}</p>
        <p><b>Time:</b> ${new Date(timestamp).toLocaleString()}</p>
        <p style="color:red;"><b>Status: UNHEALTHY</b></p>
      `,
    });

    console.log("✅ Email (DOWN) sent");
    return true;
  } catch (err: any) {
    console.error("❌ Email DOWN failed:", err.message, err.response);
    return false;
  }
}

/* =========================
   EMAIL: WEBSITE RECOVERED
========================= */
export async function sendEmailNotificationRecovered(
  websiteName: string,
  url: string,
  statusCode: number,
  timestamp: string
): Promise<boolean> {
  const transporter = await getEmailTransporter();
  if (!transporter) return false;

  const recipients = [
    "syedomerali2006@gmail.com",
    "suhailroushan13@gmail.com",
    "sami@codeforindia.com",
  ];

  try {
    await transporter.sendMail({
      from: `"Health Monitor" <${process.env.EMAIL_USER}>`,
      to: recipients.join(","),
      subject: `✅ Website RECOVERED: ${websiteName}`,
      html: `
        <h2>Website Recovered</h2>
        <p><b>Website:</b> ${websiteName}</p>
        <p><b>URL:</b> ${url}</p>
        <p><b>Status Code:</b> ${statusCode}</p>
        <p><b>Time:</b> ${new Date(timestamp).toLocaleString()}</p>
        <p style="color:green;"><b>Status: HEALTHY</b></p>
      `,
    });

    console.log("✅ Email (RECOVERED) sent");
    return true;
  } catch (err: any) {
    console.error("❌ Email RECOVERED failed:", err.message, err.response);
    return false;
  }
}

/* =========================
   SMS: WEBSITE DOWN
========================= */
export async function sendSMSNotificationDown(
  websiteName: string,
  url: string,
  statusCode: number,
  timestamp: string
): Promise<boolean> {
  const client = getTwilioClient();
  if (!client) return false;

  const from = process.env.TWILIO_PHONE_NUMBER!;
  const recipients = ["+919618211626", "+919701889473"];

  try {
    for (const to of recipients) {
      const res = await client.messages.create({
        from,
        to,
        body: `⚠️ WEBSITE DOWN
${websiteName}
${url}
Status: ${statusCode}
Time: ${new Date(timestamp).toLocaleString()}`,
      });

      console.log("✅ SMS sent:", res.sid);
    }
    return true;
  } catch (err: any) {
    console.error("❌ SMS DOWN failed:", err.code, err.message);
    return false;
  }
}

/* =========================
   SMS: WEBSITE RECOVERED
========================= */
export async function sendSMSNotificationRecovered(
  websiteName: string,
  url: string,
  statusCode: number,
  timestamp: string
): Promise<boolean> {
  const client = getTwilioClient();
  if (!client) return false;

  const from = process.env.TWILIO_PHONE_NUMBER!;
  const recipients = ["+919618211626", "+919701889473"];

  try {
    for (const to of recipients) {
      const res = await client.messages.create({
        from,
        to,
        body: `✅ WEBSITE RECOVERED
${websiteName}
${url}
Status: ${statusCode}
Time: ${new Date(timestamp).toLocaleString()}`,
      });

      console.log("✅ SMS sent:", res.sid);
    }
    return true;
  } catch (err: any) {
    console.error("❌ SMS RECOVERED failed:", err.code, err.message);
    return false;
  }
}

/* =========================
   COMBINED HELPERS
========================= */
export async function sendNotificationsDown(
  websiteName: string,
  url: string,
  statusCode: number,
  timestamp: string
) {
  await Promise.allSettled([
    sendEmailNotificationDown(websiteName, url, statusCode, timestamp),
    sendSMSNotificationDown(websiteName, url, statusCode, timestamp),
  ]);
}

export async function sendNotificationsRecovered(
  websiteName: string,
  url: string,
  statusCode: number,
  timestamp: string
) {
  await Promise.allSettled([
    sendEmailNotificationRecovered(websiteName, url, statusCode, timestamp),
    sendSMSNotificationRecovered(websiteName, url, statusCode, timestamp),
  ]);
}
