# Website Health Monitor

A comprehensive real-time website and API health monitoring system built with Next.js, TypeScript, and Tailwind CSS. Monitor multiple websites simultaneously, receive instant notifications via email and SMS when sites go down, and maintain detailed logs of all health checks.

## 🚀 Features

- **Real-time Monitoring**: Automatic health checks every 1 minute for all enabled websites
- **Dashboard View**: Visual cards showing health status, last checked time, and status codes
- **Live Health Check Page**: Real-time updates of API calls with timestamps
- **History & Logs**: Complete history of all health checks grouped by website (latest 10 per website)
- **Dynamic Website Management**: Add/remove websites dynamically through the UI
- **Toggle Monitoring**: Enable/disable monitoring for individual websites
- **Email Notifications**: Get notified via email when websites go down or recover (using Nodemailer)
- **SMS Notifications**: Receive SMS alerts via Twilio when websites go down or recover
- **File Logging**: Automatic creation of `.txt` files in `data/` folder for each website
- **Export Logs**: Download all health check logs as CSV files
- **Smart Notifications**: One-time notifications only when status changes (no spam)
- **Website Favicons**: Automatic display of website favicons for easy identification
- **Countdown Timer**: Visual countdown showing time until next health check

## 📁 Project Structure

```
client/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── cron/
│   │   │   └── health-check/     # Cron endpoint for background health checks
│   │   ├── export-logs/          # Export logs as CSV
│   │   ├── health/               # Perform health check on a URL
│   │   ├── logs/                 # Get health check logs
│   │   ├── monitored-urls/       # CRUD operations for monitored URLs
│   │   ├── start-background-task/# Start background health check task
│   │   └── status/               # Get current status of all monitored URLs
│   ├── home/                     # Live Health Check page
│   │   └── page.tsx
│   ├── logs/                     # History & Logs page
│   │   └── page.tsx
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Dashboard page (home)
│   └── globals.css               # Global styles
├── components/                    # React components
│   ├── AddWebsiteModal.tsx       # Modal for adding new websites
│   ├── HealthCard.tsx            # Health status card component
│   └── Navigation.tsx            # Navigation bar component
├── lib/                          # Utility libraries
│   ├── backgroundTask.ts         # Background health check task
│   ├── favicon.ts                # Favicon URL generator
│   ├── fileLogger.ts            # File logging utilities
│   ├── healthCheck.ts           # Health check logic
│   ├── healthStore.ts           # In-memory data store
│   ├── initBackgroundTask.ts    # Initialize background task
│   └── notifications.ts         # Email and SMS notification services
├── types/                        # TypeScript type definitions
│   └── health.ts                 # Health monitoring types
├── data/                         # Generated log files (created automatically)
│   └── {website-name}.txt        # Individual website log files
├── public/                       # Static assets
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript configuration
├── next.config.ts                # Next.js configuration
└── .env.local                    # Environment variables (create this file)
```

## 🔌 API Endpoints

### Health Check APIs

#### `POST /api/health`
Perform a health check on a specific URL.

**Request Body:**
```json
{
  "url": "https://www.example.com"
}
```

**Response:**
```json
{
  "id": "timestamp-random",
  "url": "https://www.example.com",
  "timestamp": "2025-12-25T10:30:00.000Z",
  "statusCode": 200,
  "isHealthy": true
}
```

#### `GET /api/health?url={url}`
Perform a health check via GET request.

**Query Parameters:**
- `url` (required): The URL to check

---

### Status APIs

#### `GET /api/status`
Get the current health status of all monitored URLs.

**Response:**
```json
[
  {
    "url": "https://www.example.com",
    "lastChecked": "2025-12-25T10:30:00.000Z",
    "statusCode": 200,
    "isHealthy": true
  }
]
```

---

### Logs APIs

#### `GET /api/logs`
Get all health check logs.

**Query Parameters:**
- `url` (optional): Filter logs by specific URL

**Response:**
```json
[
  {
    "id": "timestamp-random",
    "url": "https://www.example.com",
    "timestamp": "2025-12-25T10:30:00.000Z",
    "statusCode": 200,
    "isHealthy": true
  }
]
```

#### `GET /api/export-logs`
Export all logs as a CSV file.

**Response:** CSV file download

---

### Monitored URLs APIs

#### `GET /api/monitored-urls`
Get all monitored URLs.

**Response:**
```json
[
  {
    "id": "timestamp-random",
    "url": "https://www.example.com",
    "name": "Example",
    "enabled": true
  }
]
```

#### `POST /api/monitored-urls`
Add a new website to monitor.

**Request Body:**
```json
{
  "url": "https://www.example.com",
  "name": "Example Website" // optional
}
```

**Response:**
```json
{
  "id": "timestamp-random",
  "url": "https://www.example.com",
  "name": "Example Website",
  "enabled": true
}
```

#### `PATCH /api/monitored-urls`
Update the enabled/disabled status of a monitored URL.

**Request Body:**
```json
{
  "id": "timestamp-random",
  "enabled": false
}
```

**Response:**
```json
{
  "success": true,
  "url": {
    "id": "timestamp-random",
    "url": "https://www.example.com",
    "name": "Example Website",
    "enabled": false
  }
}
```

#### `DELETE /api/monitored-urls?id={id}`
Remove a monitored URL.

**Query Parameters:**
- `id` (required): The ID of the URL to remove

**Response:**
```json
{
  "success": true
}
```

---

### Background Task APIs

#### `GET /api/cron/health-check`
Cron endpoint for background health checks (runs every 1 minute).

**Headers:**
- `Authorization: Bearer {CRON_SECRET}` (optional, if CRON_SECRET is set)

**Response:**
```json
{
  "message": "Health checks completed",
  "timestamp": "2025-12-25T10:30:00.000Z",
  "results": [
    {
      "url": "https://www.example.com",
      "success": true,
      "statusCode": 200,
      "isHealthy": true
    }
  ]
}
```

#### `POST /api/start-background-task`
Manually start the background health check task.

**Response:**
```json
{
  "message": "Background health check task started"
}
```

## 🔧 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Email Configuration (Nodemailer)

```env
# Email account credentials
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587

# Recipient email (optional, defaults to EMAIL_USER)
NOTIFICATION_EMAIL=recipient@example.com
```

**Gmail Setup:**
1. Enable 2-Step Verification on your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the App Password (not your regular password) in `EMAIL_PASSWORD`

**Other Email Providers:**
- For Outlook: `EMAIL_HOST=smtp-mail.outlook.com`, `EMAIL_PORT=587`
- For Yahoo: `EMAIL_HOST=smtp.mail.yahoo.com`, `EMAIL_PORT=587`
- For custom SMTP: Set `EMAIL_HOST` and `EMAIL_PORT` accordingly

### SMS Configuration (Twilio)

```env
# Twilio account credentials
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Recipient phone number (optional, can be set in code)
NOTIFICATION_PHONE=+1234567890
```

**Twilio Setup:**
1. Sign up at https://www.twilio.com
2. Get your Account SID and Auth Token from the dashboard
3. Purchase a phone number from Twilio
4. Add recipient phone numbers in the code or via environment variable

### Optional Configuration

```env
# Secret key for securing the cron endpoint
CRON_SECRET=your-secret-key-here
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Email account (Gmail recommended) or SMTP server
- Twilio account (for SMS notifications)

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd Website-Health-Monitor/client
```

2. **Install dependencies:**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Set up environment variables:**
Create a `.env.local` file in the root directory and add your configuration (see Environment Variables section above).

4. **Run the development server:**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

## 📊 How It Works

### Health Check Process

1. **Automatic Background Checks**: The system runs health checks every 1 minute in the background for all enabled websites.

2. **Health Status Determination**:
   - **Healthy**: HTTP status code 200 or 201
   - **Unhealthy**: Any other status code or network error

3. **Notification System**:
   - **Down Alert**: Sent once when a website status changes from healthy → unhealthy
   - **Recovery Alert**: Sent once when a website status changes from unhealthy → healthy
   - **No Spam**: Notifications are only sent on state changes, not on every check

4. **File Logging**: Each website gets its own `.txt` file in the `data/` folder with:
   - Website name and URL
   - Creation timestamp
   - All health check logs with date, time, status code, and health status

5. **Data Storage**: Currently uses in-memory storage. Can be easily replaced with a database.

### Pages

- **Dashboard (`/`)**: Main page showing health status cards for all monitored websites with countdown timer
- **Live Health Check (`/home`)**: Real-time table showing all health checks as they happen
- **History & Logs (`/logs`)**: Complete history grouped by website, showing latest 10 logs per website

## 🛠️ Technologies Used

- **Next.js 16**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Nodemailer**: Email sending library
- **Twilio**: SMS messaging service
- **Node.js**: Server-side runtime

## 📝 Notes

- The `data/` folder is automatically created when the first website is added
- Log files are stored as `{sanitized-website-name}.txt` in the `data/` folder
- The system keeps the last 1000 logs in memory
- Background health checks start automatically when the server starts
- All notifications are sent asynchronously and won't block health checks

## 🔒 Security

- Environment variables should never be committed to version control
- The `.env.local` file is automatically ignored by git
- Use strong secrets for `CRON_SECRET` if protecting the cron endpoint
- Keep your email and Twilio credentials secure

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📧 Support

For support, email the development team or open an issue in the repository.
