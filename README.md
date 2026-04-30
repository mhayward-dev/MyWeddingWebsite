# Cansu & Mark's Wedding Website

A wedding website built with Firebase Hosting and Cloud Functions, featuring RSVP functionality with Google Sheets tracking and Telegram notifications.

## Features

- **Multi-language support**: English, German, and Turkish
- **RSVP form**: Collects guest responses with dietary requirements
- **Google Sheets integration**: Automatically logs RSVPs to a spreadsheet
- **Telegram notifications**: Instant alerts when guests RSVP
- **Responsive design**: Works on mobile and desktop
- **Timeline**: Day's schedule with venue information

## Project Structure

```
├── src/
│   ├── site/                # Static website files
│   │   ├── index.html       # Main landing page
│   │   ├── rsvp.html        # RSVP form page
│   │   ├── css/             # Stylesheets
│   │   ├── js/              # JavaScript (i18n)
│   │   └── images/          # Photos and icons
│   └── functions/           # Firebase Cloud Functions
│       ├── index.js         # RSVP handler function
│       ├── package.json     # Function dependencies
│       └── SETUP.md         # Detailed setup guide
├── firebase.json            # Firebase configuration
└── .firebaserc              # Firebase project settings
```

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v22+
- [Firebase CLI](https://firebase.google.com/docs/cli): `npm install -g firebase-tools`
- A Firebase project with Blaze (pay-as-you-go) plan

### 1. Install Dependencies

```bash
cd src/functions
npm install
```

### 2. Configure Secrets

```bash
firebase functions:secrets:set TELEGRAM_BOT_TOKEN
firebase functions:secrets:set TELEGRAM_CHAT_ID
firebase functions:secrets:set SPREADSHEET_ID
```

See [functions/SETUP.md](src/functions/SETUP.md) for detailed instructions on:
- Creating a Telegram bot
- Setting up the Google Sheet
- Enabling required APIs

### 3. Deploy

```bash
# Deploy everything
firebase deploy

# Or deploy separately
firebase deploy --only hosting
firebase deploy --only functions
```

## Local Development

```bash
firebase emulators:start
```

Visit `http://localhost:5000` to view the site.

## Configuration

### Firebase Project

Update `.firebaserc` with your project ID:
```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

### Environment

The Cloud Function uses Firebase Secrets for sensitive configuration:
- `TELEGRAM_BOT_TOKEN` - Bot token from @BotFather
- `TELEGRAM_CHAT_ID` - Group chat ID (negative number)
- `SPREADSHEET_ID` - Google Sheet ID from URL

## Architecture

```
User submits RSVP form
        │
        ▼
   POST /api/rsvp
        │
        ▼
Firebase Cloud Function (europe-west1)
        │
        ├──► Google Sheets API (append row)
        │
        └──► Telegram Bot API (send notification)
```

## License

Private - All rights reserved.
