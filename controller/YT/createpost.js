const YtPost = require('../../model/YT/ytvideo');
const { scheduleYouTubePosts } = require('./ytuploader.js');
const axios = require('axios');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const ACcount = require('../../model/YT/account');

// Configuration
const TOKENS_DIR = path.join(__dirname, '../tokens');
const TEMP_DIR = path.join(__dirname, '../temp');

// Ensure directories exist
[TOKENS_DIR, TEMP_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Helper functions
function getTokenPath(accountId) {
  return path.join(TOKENS_DIR, `${accountId}_token.json`);
}

async function verifyTokenValidity(oauth2Client) {
  try {
    const youtube = google.youtube({ version: "v3", auth: oauth2Client });
    await youtube.channels.list({ part: 'snippet', mine: true });
    return true;
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return false;
  }
}

async function getOrRefreshToken(accountId, clientId, clientSecret, redirectUri) {
  const tokenPath = getTokenPath(accountId);
  
  // If no token exists, return null
  if (!fs.existsSync(tokenPath)) {
    return null;
  }

  const tokens = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  oauth2Client.setCredentials(tokens);

  // Check if token is expired or about to expire (within 5 minutes)
  const now = Date.now();
  if (tokens.expiry_date && now < tokens.expiry_date - 300000) {
    return tokens;
  }

  try {
    // Refresh the token
    const { credentials } = await oauth2Client.refreshToken(tokens.refresh_token);
    const newTokens = {
      ...tokens,
      access_token: credentials.access_token,
      expiry_date: credentials.expiry_date
    };
    
    fs.writeFileSync(tokenPath, JSON.stringify(newTokens));
    return newTokens;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    // Delete invalid token file
    fs.unlinkSync(tokenPath);
    return null;
  }
}

const postYouTubeVideo = async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.videoUrl || !req.body.title || !req.body.description || 
        !req.body.CLIENT_ID || !req.body.CLIENT_SECRET || !req.body.REDIRECT_URI || 
        !req.body.unixtime || !req.body.account) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const { account, CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = req.body;
    let authUrl = null;

    // Check for existing valid token
    const tokens = await getOrRefreshToken(account, CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    
    if (!tokens) {
      // No valid token, generate auth URL
      const oauth2Client = new google.auth.OAuth2(
        CLIENT_ID,
        CLIENT_SECRET,
        REDIRECT_URI
      );
      
      authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/youtube.upload'],
        prompt: 'consent',
        state: JSON.stringify({
          account : account,
          redirectBack: req.body.redirectBack || null
        })
      });
    }

    // Create the post in database
    const postData = {
      ...req.body,
      status: tokens ? 'pending' : 'needs_authorization',
      ...(tokens && { 
        ACCESS_TOKEN: tokens.access_token,
        REFRESH_TOKEN: tokens.refresh_token,
        EXPIRY_DATE: tokens.expiry_date
      })
    };

    const response = await YtPost.create(postData);
    
    console.log(`Created new YouTube video scheduled for ${new Date(parseInt(response.unixtime) * 1000)}`);
    
    // Trigger the scheduler
    scheduleYouTubePosts();

    res.status(201).json({
      ...response._doc,
      isoTime: new Date(parseInt(response.unixtime) * 1000).toISOString(),
      isUpcoming: parseInt(response.unixtime) > Math.floor(Date.now() / 1000),
      ...(authUrl && { authorizationRequired: true, authUrl })
    });
  } catch (error) {
    console.error("Error creating YouTube post:", error);
    res.status(500).json({ message: error.message });
  }
}

const handleAuthCallback = async (req, res) => {
  try {
    const { accountId } = req.params;
    
    const Findaccount = await ACcount.findOne({accountname: accountId});
    
    if (!Findaccount) {
      return res.status(404).json({ message: "Account not found" });
    }

    const account = Findaccount.account;
    const { code } = req.query;

    const oauth2Client = new google.auth.OAuth2({
      clientId: Findaccount.CLIENT_ID,
      clientSecret: Findaccount.CLIENT_SECRET,
      // redirectUri: `http://localhost:5003/api/callback/${Findaccount.accountname}`
      redirectUri : `https://meta.ritaz.in/api/callback/${Findaccount.accountname}`
    });

    const { tokens } = await oauth2Client.getToken(code);
    
    if (!tokens.refresh_token) {
      throw new Error('No refresh token received - please reauthenticate');
    }

    // Store the tokens
    const tokenPath = getTokenPath(Findaccount.accountname);
    fs.writeFileSync(tokenPath, JSON.stringify(tokens));

    res.json({ 
      success: true,
      message: 'Authentication successful',
      acc : Findaccount.accountname
    });
  } catch (error) {
    console.error("Error handling auth callback:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

const getAuthStatus = async (req, res) => {
  try {
    const { account, CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = req.body;

    if (!account || !CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    const tokens = await getOrRefreshToken(account, CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    
    if (tokens) {
      return res.json({ 
        authenticated: true,
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null
      });
    }

    // Not authenticated, generate auth URL
    const oauth2Client = new google.auth.OAuth2(
      CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT_URI
    );
    
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/youtube.upload'],
      prompt: 'consent',
      state: JSON.stringify({
        account,
        redirectBack: req.body.redirectBack || null
      })
    });

    res.json({
      authenticated: false,
      authUrl
    });
  } catch (error) {
    console.error("Error checking auth status:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

module.exports = { 
  postYouTubeVideo,
  handleAuthCallback,
  getAuthStatus
};