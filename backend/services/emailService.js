const { google } = require("googleapis");
const { OAuth2Client } = require("google-auth-library");

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

// --- OAuth2 Client Setup ---
let oauth2Client;
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_REDIRECT_URI) {
  oauth2Client = new OAuth2Client(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );
  console.log("OAuth2 Client Initialized in Email Service.");
} else {
  console.error(
    "CRITICAL ERROR: Missing Google OAuth credentials in .env file. Email fetching will not work."
  );
  oauth2Client = null;
}

let currentTokens = null;

/**
 * Stores the obtained tokens in memory.
 * In a real app, store these securely (e.g., database, encrypted store).
 * Especially the refresh token.
 * @param {object} tokens - The tokens object received from Google.
 */
function setTokens(tokens) {
  console.log("Storing tokens (in memory - PoC only):", tokens);
  currentTokens = tokens;
  // IMPORTANT: If tokens include a refresh_token, set it on the client
  // so it can be used automatically to refresh the access token later.
  if (tokens.refresh_token) {
    oauth2Client.setCredentials(tokens);
    console.log("Refresh token set on OAuth2 client.");
  } else {
    // If only access token is provided (e.g., from a refresh)
    oauth2Client.setCredentials({ access_token: tokens.access_token });
    console.log("Access token set on OAuth2 client.");
  }
}

/**
 * Retrieves the current tokens stored in memory.
 * @returns {object | null} The stored tokens or null.
 */
function getTokens() {
  return currentTokens;
}

/**
 * Generates the Google Consent Screen URL.
 * @returns {string | null} The authorization URL or null if client not initialized.
 */
function generateAuthUrl() {
  if (!oauth2Client) return null;

  const scopes = ["https://www.googleapis.com/auth/gmail.readonly"];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
  });
  console.log("Generated Auth URL:", authUrl);
  return authUrl;
}

/**
 * Exchanges an authorization code for access and refresh tokens.
 * @param {string} code - The authorization code from Google redirect.
 * @returns {Promise<object|null>} The obtained tokens or null on error.
 */
async function getTokensFromCode(code) {
  if (!oauth2Client) {
    console.error(
      "OAuth2 client not initialized, cannot get tokens from code."
    );
    return null;
  }
  try {
    console.log("Attempting to exchange code for tokens...");
    const { tokens } = await oauth2Client.getToken(code);
    console.log("Successfully obtained tokens from code.");
    setTokens(tokens);
    return tokens;
  } catch (error) {
    console.error(
      "Error exchanging authorization code for tokens:",
      error.message
    );
    return null;
  }
}

async function fetchLatestUnreadEmail() {
  if (!oauth2Client || !currentTokens) {
    console.error("Cannot fetch email: OAuth client or tokens not available.");
    return null;
  }
  console.log("Fetching latest unread email...");
  // TODO: Implement Gmail API call
  return {
    subject: "Placeholder Subject",
    body: "Placeholder Body - Fetching not implemented yet.",
  };
}

module.exports = {
  oauth2Client,
  generateAuthUrl,
  getTokensFromCode,
  setTokens,
  getTokens,
  fetchLatestUnreadEmail,
};
