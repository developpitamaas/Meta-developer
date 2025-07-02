// const YtPost = require('../../model/YT/ytvideo');
// const { scheduleYouTubePosts } = require('./ytuploader.js');
// const axios = require('axios');
// const { google } = require('googleapis');
// const fs = require('fs');
// const path = require('path');

// // Configuration
// const TOKENS_DIR = path.join(__dirname, '../../tokens');
// const TEMP_DIR = path.join(__dirname, '../../temp');

// // Ensure directories exist
// [TOKENS_DIR, TEMP_DIR].forEach(dir => {
//   if (!fs.existsSync(dir)) {
//     fs.mkdirSync(dir, { recursive: true });
//   }
// });

// // Helper functions
// function getTokenPath(accountId) {
//   return path.join(TOKENS_DIR, `${accountId}_token.json`);
// }

// async function verifyTokenValidity(oauth2Client) {
//   try {
//     const youtube = google.youtube({ version: "v3", auth: oauth2Client });
//     await youtube.channels.list({ part: 'snippet', mine: true });
//     return true;
//   } catch (error) {
//     console.error('Token verification failed:', error.message);
//     return false;
//   }
// }

// async function getOrRefreshToken(accountId, clientId, clientSecret, redirectUri) {
//   const tokenPath = getTokenPath(accountId);
  
//   // If no token exists, return null
//   if (!fs.existsSync(tokenPath)) {
//     return null;
//   }

//   const tokens = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
//   const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
//   oauth2Client.setCredentials(tokens);

//   // Check if token is expired or about to expire (within 5 minutes)
//   const now = Date.now();
//   if (tokens.expiry_date && now < tokens.expiry_date - 300000) {
//     return tokens;
//   }

//   try {
//     // Refresh the token
//     const { credentials } = await oauth2Client.refreshToken(tokens.refresh_token);
//     const newTokens = {
//       ...tokens,
//       access_token: credentials.access_token,
//       expiry_date: credentials.expiry_date
//     };
    
//     fs.writeFileSync(tokenPath, JSON.stringify(newTokens));
//     return newTokens;
//   } catch (error) {
//     console.error('Failed to refresh token:', error);
//     // Delete invalid token file
//     fs.unlinkSync(tokenPath);
//     return null;
//   }
// }

// const postYouTubeVideo = async (req, res) => {
//   try {
//     // Validate required fields
//     if (!req.body.videoUrl || !req.body.title || !req.body.description || 
//         !req.body.CLIENT_ID || !req.body.CLIENT_SECRET || !req.body.REDIRECT_URI || 
//         !req.body.unixtime || !req.body.account) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     const { account, CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = req.body;
//     let authUrl = null;

//     // Check for existing valid token
//     const tokens = await getOrRefreshToken(account, CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    
//     if (!tokens) {
//       // No valid token, generate auth URL
//       const oauth2Client = new google.auth.OAuth2(
//         CLIENT_ID,
//         CLIENT_SECRET,
//         REDIRECT_URI
//       );
      
//       authUrl = oauth2Client.generateAuthUrl({
//         access_type: 'offline',
//         scope: ['https://www.googleapis.com/auth/youtube.upload'],
//         prompt: 'consent',
//         state: JSON.stringify({
//           account : account,
//           redirectBack: req.body.redirectBack || null
//         })
//       });
//     }

//     // Create the post in database
//     const postData = {
//       ...req.body,
//       status: tokens ? 'pending' : 'needs_authorization',
//       ...(tokens && { 
//         ACCESS_TOKEN: tokens.access_token,
//         REFRESH_TOKEN: tokens.refresh_token,
//         EXPIRY_DATE: tokens.expiry_date
//       })
//     };

//     const response = await YtPost.create(postData);
    
//     console.log(`Created new YouTube video scheduled for ${new Date(parseInt(response.unixtime) * 1000)}`);
    
//     // Trigger the scheduler
//     scheduleYouTubePosts();

//     res.status(201).json({
//       ...response._doc,
//       isoTime: new Date(parseInt(response.unixtime) * 1000).toISOString(),
//       isUpcoming: parseInt(response.unixtime) > Math.floor(Date.now() / 1000),
//       ...(authUrl && { authorizationRequired: true, authUrl })
//     });
//   } catch (error) {
//     console.error("Error creating YouTube post:", error);
//     res.status(500).json({ message: error.message });
//   }
// }

// // Add these endpoints to handle the OAuth flow
// const handleAuthCallback = async (req, res) => {
//   try {
//     const { account } = req.params;
//     const { code } = req.query;
//     const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = req.body;

//     if (!code || !CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
//       return res.status(400).json({ message: "Missing required parameters" });
//     }

//     const oauth2Client = new google.auth.OAuth2(
//       CLIENT_ID,
//       CLIENT_SECRET,
//       REDIRECT_URI
//     );
//     console.log("REDIRECT_URI",REDIRECT_URI)

//     const { tokens } = await oauth2Client.getToken(code);
    
//     if (!tokens.refresh_token) {
//       throw new Error('No refresh token received - please reauthenticate');
//     }

//     // Store the tokens
//     const tokenPath = getTokenPath(account);
//     fs.writeFileSync(tokenPath, JSON.stringify(tokens));

//     res.json({ 
//       success: true,
//       message: 'Authentication successful',
//       account
//     });
//   } catch (error) {
//     console.error("Error handling auth callback:", error);
//     res.status(500).json({ 
//       success: false,
//       message: error.message 
//     });
//   }
// };

// const getAuthStatus = async (req, res) => {
//   try {
//     const { account, CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = req.body;

//     if (!account || !CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
//       return res.status(400).json({ message: "Missing required parameters" });
//     }

//     const tokens = await getOrRefreshToken(account, CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    
//     if (tokens) {
//       return res.json({ 
//         authenticated: true,
//         expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null
//       });
//     }

//     // Not authenticated, generate auth URL
//     const oauth2Client = new google.auth.OAuth2(
//       CLIENT_ID,
//       CLIENT_SECRET,
//       REDIRECT_URI
//     );
    
//     const authUrl = oauth2Client.generateAuthUrl({
//       access_type: 'offline',
//       scope: ['https://www.googleapis.com/auth/youtube.upload'],
//       prompt: 'consent',
//       state: JSON.stringify({
//         account,
//         redirectBack: req.body.redirectBack || null
//       })
//     });

//     res.json({
//       authenticated: false,
//       authUrl
//     });
//   } catch (error) {
//     console.error("Error checking auth status:", error);
//     res.status(500).json({ 
//       success: false,
//       message: error.message 
//     });
//   }
// };

// module.exports = { 
//   postYouTubeVideo,
//   handleAuthCallback,
//   getAuthStatus
// };

// const YtPost = require('../../model/YT/ytvideo');
// const { scheduleYouTubePosts } = require('./ytuploader.js');
// const axios = require('axios');
// const { google } = require('googleapis');
// const fs = require('fs');
// const path = require('path');
// const ACcount = require('../../model/YT/account');

// // Configuration
// const TOKENS_DIR = path.join(__dirname, '../tokens');
// const TEMP_DIR = path.join(__dirname, '../temp');

// // Ensure directories exist
// [TOKENS_DIR, TEMP_DIR].forEach(dir => {
//   if (!fs.existsSync(dir)) {
//     fs.mkdirSync(dir, { recursive: true });
//   }
// });

// // Helper functions
// function getTokenPath(accountId) {
//   return path.join(TOKENS_DIR, `${accountId}_token.json`);
// }

// function getCredentialsPath(accountId) {
//   return path.join(TOKENS_DIR, `${accountId}_credentials.json`);
// }

// async function verifyTokenValidity(oauth2Client) {
//   try {
//     const youtube = google.youtube({ version: "v3", auth: oauth2Client });
//     await youtube.channels.list({ part: 'snippet', mine: true });
//     return true;
//   } catch (error) {
//     console.error('Token verification failed:', error.message);
//     return false;
//   }
// }
 

// async function getOrRefreshToken(accountId) {
//   const tokenPath = getTokenPath(accountId);
//   const credentialsPath = getCredentialsPath(accountId);
  
//   if (!fs.existsSync(tokenPath)) {
//     console.log(`No token file found for account ${accountId}`);
//     return null;
//   }

//   // Get credentials from credentials file
//   if (!fs.existsSync(credentialsPath)) {
//     throw new Error(`Credentials not found for account ${accountId}`);
//   }
  
//   const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
//   const tokens = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
  
//   const oauth2Client = new google.auth.OAuth2(
//     credentials.CLIENT_ID,
//     credentials.CLIENT_SECRET,
//     credentials.REDIRECT_URI
//   );
  
//   oauth2Client.setCredentials(tokens);

//     // const oauth2Client = new google.auth.OAuth2(
//     //   tokenData.clientId,
//     //   tokenData.clientSecret,
//     //   tokenData.redirectUri
//     // );

//   try {
//     // Refresh the token
//     const { credentials: newTokens } = await oauth2Client.refreshToken(tokens.refresh_token);
//     const updatedTokens = {
//       ...tokens,
//       access_token: newTokens.access_token,
//       expiry_date: newTokens.expiry_date
//     };
    
//     fs.writeFileSync(tokenPath, JSON.stringify(updatedTokens));
//     return updatedTokens;
//   } catch (error) {
//     console.error(`Error processing token for ${accountId}:`, error);
//     return null;
//   }
// }
// const postYouTubeVideo = async (req, res) => {
//   try {
//     // Validate required fields
//     if (!req.body.videoUrl || !req.body.title || !req.body.description || 
//         !req.body.CLIENT_ID || !req.body.CLIENT_SECRET || !req.body.REDIRECT_URI || 
//         !req.body.unixtime || !req.body.account) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     const { account } = req.body;
//     let authUrl = null;

//     // Store credentials for later use
//     const credentialsPath = getCredentialsPath(account);
//     fs.writeFileSync(credentialsPath, JSON.stringify({
//       CLIENT_ID: req.body.CLIENT_ID,
//       CLIENT_SECRET: req.body.CLIENT_SECRET,
//       REDIRECT_URI: req.body.REDIRECT_URI
//     }));

//     // Check for existing valid token
//     let tokens = null;
//     try {
//       tokens = await getOrRefreshToken(account);
//     } catch (error) {
//       console.warn('Token check failed:', error.message);
//       // Proceed to generate auth URL
//     }
    
//     if (!tokens) {
//       // No valid token, generate auth URL
//       const oauth2Client = new google.auth.OAuth2(
//         req.body.CLIENT_ID,
//         req.body.CLIENT_SECRET,
//         req.body.REDIRECT_URI
//       );
      
//       authUrl = oauth2Client.generateAuthUrl({
//         access_type: 'offline',
//         scope: ['https://www.googleapis.com/auth/youtube.upload'],
//         prompt: 'consent',
//         state: JSON.stringify({
//           account : account,
//           redirectBack: req.body.redirectBack || null
//         })
//       });
//     }

//     // Create the post in database
//     const postData = {
//       ...req.body,
//       status: tokens ? 'pending' : 'needs_authorization'
//     };

//     const response = await YtPost.create(postData);
    
//     console.log(`Created new YouTube video scheduled for ${new Date(parseInt(response.unixtime) * 1000)}`);
    
//     // Trigger the scheduler
//     scheduleYouTubePosts();

//     const responseData = {
//       ...response._doc,
//       isoTime: new Date(parseInt(response.unixtime) * 1000).toISOString(),
//       isUpcoming: parseInt(response.unixtime) > Math.floor(Date.now() / 1000)
//     };

//     if (authUrl) {
//       responseData.authorizationRequired = true;
//       responseData.authUrl = authUrl;
//     }

//     res.status(201).json(responseData);
//   } catch (error) {
//     console.error("Error creating YouTube post:", error);
//     res.status(500).json({ message: error.message });
//   }
// }

// // Updated callback handler
// const handleAuthCallback = async (req, res) => {
//   try {
//     const { accountId } = req.params;
//     const { code, state } = req.query;
//     console.log("----1 callbacked")
//     console.log("----",accountId)
//     // Get credentials from stored file
//     const credentialsPath = getCredentialsPath(accountId);
//     if (!fs.existsSync(credentialsPath)) {
//       return res.status(400).json({ 
//         success: false,
//         message: `Credentials not found for account ${accountId}`
//       });
//     }

//     const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
//     const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = credentials;

//     if (!code) {
//       return res.status(400).json({ 
//         success: false,
//         message: "Missing authorization code" 
//       });
//     }

//     const oauth2Client = new google.auth.OAuth2(
//       account.CLIENT_ID,
//       account.CLIENT_SECRET,
//       // account.REDIRECT_URI
//       `http://localhost:5003/api/callback/${account.accountname}`
//       // `https://meta.ritaz.in/api/callback/${account.accountname}`
//     );

//     const { tokens } = await oauth2Client.getToken(code);
    
//     // Handle missing refresh token
//     if (!tokens.refresh_token) {
//       const tokenPath = getTokenPath(accountId);
//       if (fs.existsSync(tokenPath)) {
//         const existingTokens = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
//         tokens.refresh_token = existingTokens.refresh_token;
//       }
      
//       if (!tokens.refresh_token) {
//         throw new Error('No refresh token received - please reauthenticate');
//       }
//     }

//     // Store the tokens
//     const tokenPath = getTokenPath(accountId);
//     fs.writeFileSync(tokenPath, JSON.stringify(tokens));

//     // Parse state for redirect back
//     let stateObj = {};
//     try {
//       stateObj = JSON.parse(state || '{}');
//     } catch (e) {
//       console.warn('Error parsing state', e);
//     }

//     // Redirect if needed
//     if (stateObj.redirectBack) {
//       return res.redirect(stateObj.redirectBack);
//     }

//     res.json({ 
//       success: true,
//       message: 'Authentication successful',
//       account: accountId
//     });
//   } catch (error) {
//     console.error("Error handling auth callback:", error);
//     res.status(500).json({ 
//       success: false,
//       message: error.message 
//     });
//   }
// };

// module.exports = { 
//   postYouTubeVideo,
//   handleAuthCallback
// };

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

async function getOrRefreshToken(accountId) {
  const tokenPath = getTokenPath(accountId);
  if (!fs.existsSync(tokenPath)) return null;

  const tokenData = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
  const oauth2Client = new google.auth.OAuth2(
    tokenData.clientId,
    tokenData.clientSecret,
    tokenData.redirectUri
  );
  
  oauth2Client.setCredentials({
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expiry_date: tokenData.expiry_date
  });

  // Refresh if expiring within 5 minutes
  if (Date.now() < tokenData.expiry_date - 300000) {
    return tokenData;
  }

  try {
    const { credentials } = await oauth2Client.refreshToken(tokenData.refresh_token);
    const newTokenData = {
      ...tokenData,
      access_token: credentials.access_token,
      expiry_date: credentials.expiry_date,
      refreshedAt: Date.now()
    };
    
    fs.writeFileSync(tokenPath, JSON.stringify(newTokenData));
    return newTokenData;
  } catch (error) {
    console.error(`Token refresh failed for ${accountId}:`, error);
    return null;
  }
}

const postYouTubeVideo = async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.videoUrl || !req.body.title || !req.body.description  || 
        !req.body.unixtime || !req.body.account) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const { account } = req.body;
    // const { account, CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = req.body;

    const accountData = await ACcount.findOne({ accountname: account });
    const CLIENT_ID = accountData.CLIENT_ID;
    const CLIENT_SECRET = accountData.CLIENT_SECRET;
    // const REDIRECT_URI = "http://localhost:5003/api/callback/chavi";
    const REDIRECT_URI = accountData.REDIRECT_URI;

    let authUrl = null;

    // Check for existing valid token
    const tokens = await getOrRefreshToken(account);
    
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
      status: tokens ? 'pending' : 'needs_authorization'
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
    const { code } = req.query;
    
    const account = await ACcount.findOne({ accountname: accountId });
    if (!account) return res.status(404).json({ message: "Account not found" });

    const oauth2Client = new google.auth.OAuth2(
      account.CLIENT_ID,
      account.CLIENT_SECRET,
      account.REDIRECT_URI
    // `http://localhost:5003/api/callback/${account.accountname}`,

    );

    const { tokens } = await oauth2Client.getToken(code);
    
    // Store all metadata with token
    const tokenData = {
      ...tokens,
      clientId: account.CLIENT_ID,
      clientSecret: account.CLIENT_SECRET,
      redirectUri: account.REDIRECT_URI,
      // redirectUri:  `http://localhost:5003/api/callback/${account.accountname}`,
      accountId: account.accountname 
    };
    
    fs.writeFileSync(getTokenPath(account.accountname), JSON.stringify(tokenData));
    res.json({ 
      success: true,
      account: account.accountname
    });
  } catch (error) {
    console.error("Auth callback error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

const getAuthStatus = async (req, res) => {
  try {
    const { account } = req.body;
    if (!account) return res.status(400).json({ message: "Account ID required" });

    const tokens = await getOrRefreshToken(account);
    
    if (tokens) {
      return res.json({ 
        authenticated: true,
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null
      });
    }

    // Get account credentials from DB
    const accountData = await ACcount.findOne({ accountname: account });
    if (!accountData) return res.status(404).json({ message: "Account not found" });

    // Generate auth URL
    const oauth2Client = new google.auth.OAuth2(
      accountData.CLIENT_ID,
      accountData.CLIENT_SECRET,
      accountData.REDIRECT_URI
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
    console.error("Auth status check error:", error);
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