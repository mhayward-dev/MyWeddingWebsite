const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");
const { google } = require("googleapis");

// Set region for all functions
setGlobalOptions({ region: "europe-west1" });

admin.initializeApp();

// Define secrets - set via: firebase functions:secrets:set SECRET_NAME
const telegramBotToken = defineSecret("TELEGRAM_BOT_TOKEN");
const telegramChatId = defineSecret("TELEGRAM_CHAT_ID");
const spreadsheetId = defineSecret("SPREADSHEET_ID");
const sitePassword = defineSecret("SITE_PASSWORD");

/**
 * Send a message to Telegram
 */
async function sendTelegramMessage(message, botToken, chatId) {
  if (!botToken || !chatId) {
    console.warn("Telegram credentials not configured, skipping notification");
    return;
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "HTML"
    })
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Telegram API error:", error);
    throw new Error(`Telegram API error: ${error}`);
  }

  return response.json();
}

/**
 * Append RSVP data to Google Sheets
 */
async function appendToGoogleSheets(rsvpData, sheetId) {
  if (!sheetId) {
    console.warn("Spreadsheet ID not configured, skipping sheets update");
    return;
  }

  // Use Firebase Admin service account for Google Sheets API
  const auth = new google.auth.GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });

  const sheets = google.sheets({ version: "v4", auth });

  const values = [[
    new Date().toISOString(),
    rsvpData.guestName,
    rsvpData.attendance,
    rsvpData.guestCount || "N/A",
    rsvpData.dietary || "None",
    rsvpData.message || "None"
  ]];

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: "RSVPs!A:F",
    valueInputOption: "USER_ENTERED",
    requestBody: { values }
  });
}

/**
 * Main RSVP submission handler
 */
exports.submitRsvp = onRequest(
  { 
    cors: true,
    secrets: [telegramBotToken, telegramChatId, spreadsheetId, sitePassword]
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      const rsvpData = req.body;

      // Validate auth token
      const { authToken, authExpiry } = rsvpData;
      if (!authToken || !authExpiry) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      // Check token hasn't expired
      if (Date.now() > parseInt(authExpiry, 10)) {
        res.status(401).json({ error: "Session expired" });
        return;
      }

      // Verify token matches expected value
      const crypto = require("crypto");
      const expectedToken = crypto
        .createHash("sha256")
        .update(sitePassword.value() + authExpiry.toString())
        .digest("hex")
        .substring(0, 32);

      if (authToken !== expectedToken) {
        res.status(401).json({ error: "Invalid authentication" });
        return;
      }

      // Validate required fields
      if (!rsvpData.guestName || !rsvpData.attendance) {
        res.status(400).json({ error: "Missing required fields: guestName, attendance" });
        return;
      }

      // Build Telegram message
      const attending = rsvpData.attendance === "yes";
      const emoji = attending ? "🎉" : "😢";
      const status = attending ? "ATTENDING" : "NOT ATTENDING";
      
      let telegramMsg = `${emoji} <b>New RSVP</b>\n\n`;
      telegramMsg += `<b>Name:</b> ${rsvpData.guestName}\n`;
      telegramMsg += `<b>Status:</b> ${status}\n`;
      
      if (attending) {
        telegramMsg += `<b>Guests:</b> ${rsvpData.guestCount || 1}\n`;
        if (rsvpData.dietary) {
          telegramMsg += `<b>Dietary:</b> ${rsvpData.dietary}\n`;
        }
      }
      
      if (rsvpData.message) {
        telegramMsg += `\n<b>Message:</b>\n${rsvpData.message}`;
      }

      // Execute both operations in parallel
      const results = await Promise.allSettled([
        appendToGoogleSheets(rsvpData, spreadsheetId.value()),
        sendTelegramMessage(telegramMsg, telegramBotToken.value(), telegramChatId.value())
      ]);

      // Log any failures but don't fail the request
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          const service = index === 0 ? "Google Sheets" : "Telegram";
          console.error(`${service} error:`, result.reason);
        }
      });

      res.status(200).json({ 
        success: true, 
        message: "RSVP received successfully" 
      });

    } catch (error) {
      console.error("Error processing RSVP:", error);
      res.status(500).json({ error: "Failed to process RSVP" });
    }
  }
);

/**
 * Password check endpoint for site protection
 */
exports.checkPassword = onRequest(
  { 
    cors: true,
    secrets: [sitePassword]
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      const { password } = req.body;

      if (!password) {
        res.status(400).json({ error: "Password required" });
        return;
      }

      const correctPassword = sitePassword.value();
      
      if (!correctPassword) {
        console.error("SITE_PASSWORD secret not configured");
        res.status(500).json({ error: "Server configuration error" });
        return;
      }

      if (password === correctPassword) {
        // Generate a session token with 7-day expiration
        const crypto = require("crypto");
        const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days
        const token = crypto
          .createHash("sha256")
          .update(correctPassword + expiresAt.toString())
          .digest("hex")
          .substring(0, 32);

        res.status(200).json({ 
          success: true, 
          token: token,
          expiresAt: expiresAt
        });
      } else {
        res.status(401).json({ 
          success: false, 
          error: "Incorrect password" 
        });
      }

    } catch (error) {
      console.error("Error checking password:", error);
      res.status(500).json({ error: "Failed to verify password" });
    }
  }
);
