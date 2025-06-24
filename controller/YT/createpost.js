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

// const handleAuthCallback = async (req, res) => {
//   try {
//     const { accountId } = req.params;
    
//     const Findaccount = await ACcount.findOne({accountname: accountId});
    
//     if (!Findaccount) {
//       return res.status(404).json({ message: "Account not found" });
//     }

//     const account = Findaccount.account;
//     const { code } = req.query;

//     const oauth2Client = new google.auth.OAuth2({
//       clientId: Findaccount.CLIENT_ID,
//       clientSecret: Findaccount.CLIENT_SECRET,
//       redirectUri: `http://localhost:5003/api/callback/${Findaccount.accountname}`
//       // redirectUri : `https://meta.ritaz.in/api/callback/${Findaccount.accountname}`
//     });

//     const { tokens } = await oauth2Client.getToken(code);
    
//     if (!tokens.refresh_token) {
//       throw new Error('No refresh token received - please reauthenticate');
//     }

//     // Store the tokens
//     const tokenPath = getTokenPath(Findaccount.accountname);
//     fs.writeFileSync(tokenPath, JSON.stringify(tokens));

//     res.json({ 
//       success: true,
//       message: 'Authentication successful',
//       acc : Findaccount.accountname
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
  return path.join(TOKENS_DIR, `account1_token.json`);
  // return path.join(TOKENS_DIR, `${accountId}_token.json`);
}
 

async function getOrRefreshToken(accountId) {
  const tokenPath = getTokenPath(accountId);
  
  if (!fs.existsSync(tokenPath)) {
    console.log(`No token file found for account ${accountId}`);
    return null;
  }

  try {
    const tokenData = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
    console.log(`Token data loaded for ${accountId}`);
    
    // Validate required token fields
    if (!tokenData.refresh_token || !tokenData.clientId || !tokenData.clientSecret || !tokenData.redirectUri) {
      console.error('Invalid token data structure:', tokenData);
      return null;
    }

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

    // Check if token needs refresh (5 minute buffer)
    if (tokenData.expiry_date && Date.now() < tokenData.expiry_date - 300000) {
      console.log(`Using existing valid token for ${accountId}`);
      return tokenData;
    }

    console.log(`Refreshing token for ${accountId}`);
    
    try {
      const { tokens } = await oauth2Client.refreshToken(tokenData.refresh_token);
      
      if (!tokens || !tokens.access_token) {
        throw new Error('Invalid tokens received from refresh');
      }

      const newTokenData = {
        ...tokenData,
        access_token: tokens.access_token,
        expiry_date: tokens.expiry_date || Date.now() + 3600000, // Default 1 hour if not provided
        refreshedAt: Date.now()
      };

      fs.writeFileSync(tokenPath, JSON.stringify(newTokenData));
      console.log(`Token refreshed successfully for ${accountId}`);
      
      return newTokenData;
    } catch (refreshError) {
      console.error(`Refresh failed for ${accountId}:`, refreshError);
      
      // If refresh fails, try to use existing token if not expired
      if (tokenData.expiry_date && Date.now() < tokenData.expiry_date) {
        console.log(`Falling back to existing token for ${accountId}`);
        return tokenData;
      }
      
      // Token is invalid and couldn't be refreshed
      console.log(`Deleting invalid token for ${accountId}`);
      fs.unlinkSync(tokenPath);
      return null;
    }
  } catch (error) {
    console.error(`Error processing token for ${accountId}:`, error);
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
      // account.REDIRECT_URI
      // `http://localhost:5003/api/callback/${account.accountname}`
      `https://meta.ritaz.in/api/callback/${account.accountname}`
    );

    const { tokens } = await oauth2Client.getToken(code);
    
    // Store all metadata with token
    const tokenData = {
      ...tokens,
      clientId: account.CLIENT_ID,
      clientSecret: account.CLIENT_SECRET,
      redirectUri: `https://meta.ritaz.in/api/callback/${account.accountname}`,
      // redirectUri: `http://localhost:5003/api/callback/${account.accountname}`,
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