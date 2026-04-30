# RSVP Function Setup Guide

## 1. Enable Required Google Cloud APIs

Enable these APIs in the [Google Cloud Console](https://console.cloud.google.com/apis/library?project=cansu-and-marks-wedding):

- [Cloud Functions API](https://console.cloud.google.com/apis/library/cloudfunctions.googleapis.com?project=cansu-and-marks-wedding)
- [Cloud Build API](https://console.cloud.google.com/apis/library/cloudbuild.googleapis.com?project=cansu-and-marks-wedding)
- [Cloud Run API](https://console.cloud.google.com/apis/library/run.googleapis.com?project=cansu-and-marks-wedding)
- [Artifact Registry API](https://console.cloud.google.com/apis/library/artifactregistry.googleapis.com?project=cansu-and-marks-wedding)
- [Eventarc API](https://console.cloud.google.com/apis/library/eventarc.googleapis.com?project=cansu-and-marks-wedding)
- [Secret Manager API](https://console.cloud.google.com/apis/library/secretmanager.googleapis.com?project=cansu-and-marks-wedding)
- [Google Sheets API](https://console.cloud.google.com/apis/library/sheets.googleapis.com?project=cansu-and-marks-wedding)
- [Cloud Logging API](https://console.cloud.google.com/apis/library/logging.googleapis.com?project=cansu-and-marks-wedding) (for viewing logs)

## 2. Install Dependencies

```bash
cd functions
npm install
```

## 3. Create a Telegram Bot

1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Send `/newbot` and follow the prompts
3. Copy the **bot token** (looks like `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)
4. Add the bot to your wedding group chat
5. Get the **chat ID** by:
   - Add [@userinfobot](https://t.me/userinfobot) to the group, or
   - Send a message in the group, then visit:
     `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
   - Look for `"chat":{"id":-1234567890...}` (group IDs are negative numbers)

## 4. Create a Google Sheet

1. Create a new Google Sheet
2. Name the first tab exactly `RSVPs`
3. Add headers in row 1: `Timestamp | Name | Attendance | Guest Count | Dietary | Message`
4. Copy the **Spreadsheet ID** from the URL:
   `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit`
5. **Important:** Share the sheet with the **Compute Engine default service account**:
   ```
   979343302317-compute@developer.gserviceaccount.com
   ```
   Grant **Editor** access (uncheck "Notify people")

## 5. Configure Firebase Secrets

Set secrets via Firebase CLI (each command prompts for the value):
```bash
firebase functions:secrets:set TELEGRAM_BOT_TOKEN
firebase functions:secrets:set TELEGRAM_CHAT_ID
firebase functions:secrets:set SPREADSHEET_ID
```

## 6. Deploy

```bash
firebase deploy --only functions
```

A successful deploy shows:
```
✔ Deploy complete!
Function URL (submitRsvp): https://submitrsvp-xxxxx-ew.a.run.app
```

## 7. View Logs

```bash
firebase functions:log
```

Or view in [Google Cloud Console](https://console.cloud.google.com/logs/query?project=cansu-and-marks-wedding) with filter: `resource.type="cloud_run_revision"`

---

## Troubleshooting

### Telegram not sending?
- Ensure the bot is added to the group
- Check that you're using the group's chat ID (negative number like `-1234567890`)
- Verify the bot has permission to send messages in the group

### Google Sheets not updating?
- Share the sheet with `979343302317-compute@developer.gserviceaccount.com` (NOT the Firebase Admin SDK email)
- Check that the sheet tab is named exactly `RSVPs`
- Verify the `SPREADSHEET_ID` secret matches your sheet URL
- Enable the [Google Sheets API](https://console.cloud.google.com/apis/library/sheets.googleapis.com?project=cansu-and-marks-wedding)

### Deploy fails with "Permission denied enabling API"?
- Enable the API manually via the links in Step 1
- Wait 1-2 minutes after enabling, then retry

### Deploy fails with "Failed to list functions"?
- Ensure billing is enabled on the project
- Wait a few minutes if APIs were just enabled
- Try `firebase login --reauth` and retry
