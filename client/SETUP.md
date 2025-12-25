# Setup Guide for Website Health Monitor

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Email Configuration (Nodemailer)
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
NOTIFICATION_EMAIL=recipient@example.com
```

**For Gmail:**
- Use an App Password (not your regular password)
- Enable 2-Step Verification
- Generate App Password: https://myaccount.google.com/apppasswords

### Twilio Configuration (SMS)
```env
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
NOTIFICATION_PHONE=+1234567890
```

**Twilio Setup:**
1. Sign up at https://www.twilio.com
2. Get your Account SID and Auth Token from the dashboard
3. Get a phone number from Twilio
4. Add your recipient phone number

### Optional
```env
CRON_SECRET=your-secret-key
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env.local`

3. Run the development server:
```bash
npm run dev
```

## Background Health Checks

The system automatically runs health checks every 1 minute in the background. Health checks will:
- Monitor all enabled websites
- Send email notifications when a website goes down
- Send SMS notifications when a website goes down
- Log all checks to files in the `data/` folder

## Notifications

Notifications are sent when:
- A website status changes from healthy (200/201) to unhealthy
- Only one notification per downtime event (no spamming)

