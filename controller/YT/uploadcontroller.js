
// const { google } = require('googleapis');
// const fs = require('fs');
// const path = require('path');
// const axios = require('axios');
// const stream = require('stream');
// const util = require('util');

// const pipeline = util.promisify(stream.pipeline);


// // Account Configuration
// const ACCOUNTS = {  
//   account1: {
//     CLIENT_ID: process.env.ACC1CLIENT_ID,
//     CLIENT_SECRET: process.env.ACC1CLIENT_SECRET,
//     REDIRECT_URI: 'http://localhost:5003/api/callback/account1'
//     // REDIRECT_URI: 'https://meta.ritaz.in/api/callback/account1'
//   }, 
//   account2: {
//     CLIENT_ID: process.env.ACC2CLIENT_ID,
//     CLIENT_SECRET: process.env.ACC2CLIENT_SECRET,   
//     REDIRECT_URI: 'https://meta.ritaz.in/api/callback/account2'
//     // REDIRECT_URI: 'http://localhost:5003/api/callback/account2'
//   },
//   account3: {
//     CLIENT_ID: process.env.ACC3CLIENT_ID,
//     CLIENT_SECRET: process.env.ACC3CLIENT_SECRET,
//     // REDIRECT_URI: 'http://localhost:5003/api/callback/account3'
//     REDIRECT_URI: 'https://meta.ritaz.in/api/callback/account3'
//   },
//   account4: {
//     CLIENT_ID: process.env.ACC4CLIENT_ID,
//     CLIENT_SECRET: process.env.ACC4CLIENT_SECRET,
//     REDIRECT_URI: 'https://meta.ritaz.in/api/callback/account4',
//     // REDIRECT_URI: 'http://localhost:5003/api/callback/account4'
//   }
// };

// const SCOPES = ['https://www.googleapis.com/auth/youtube.upload'];
// const TOKENS_DIR = path.join(__dirname, '../tokens');
// const TEMP_DIR = path.join(__dirname, '../temp');

// // Create directories if they don't exist
// [TOKENS_DIR, TEMP_DIR].forEach(dir => {
//   if (!fs.existsSync(dir)) {
//     fs.mkdirSync(dir, { recursive: true });
//   }
// });

// function getOAuthClient(accountId) {
//   const account = ACCOUNTS[accountId];
//   if (!account) {
//     throw new Error(`Account ${accountId} not configured`);
//   }

//   const TOKEN_PATH = path.join(TOKENS_DIR, `${accountId}_token.json`);
//   const oauth2Client = new google.auth.OAuth2(
//     account.CLIENT_ID,
//     account.CLIENT_SECRET,
//     account.REDIRECT_URI
//   );

//   oauth2Client.on('tokens', (tokens) => {
//     if (tokens.refresh_token) {
//       const currentTokens = fs.existsSync(TOKEN_PATH) 
//         ? JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'))
//         : {};
//       fs.writeFileSync(TOKEN_PATH, JSON.stringify({ ...currentTokens, ...tokens }));
//     }
//   });

//   return { oauth2Client, TOKEN_PATH };
// }

// async function downloadVideoFromUrl(videoUrl) {
//   const tempFilePath = path.join(TEMP_DIR, `video-${Date.now()}${path.extname(videoUrl) || '.mp4'}`);
//   const writer = fs.createWriteStream(tempFilePath);

//   try {
//     const response = await axios({
//       method: 'GET',
//       url: videoUrl,
//       responseType: 'stream',
//       timeout: 30000 // 30 seconds timeout
//     });

//     await pipeline(response.data, writer);
//     return tempFilePath;
//   } catch (error) {
//     // Clean up if download fails
//     if (fs.existsSync(tempFilePath)) {
//       fs.unlinkSync(tempFilePath);
//     }
//     throw new Error(`Failed to download video from URL: ${error.message}`);
//   }
// }

// async function uploadToYouTube(oauth2Client, videoPath, metadata) {
//   const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
  
//   return youtube.videos.insert({
//     part: 'snippet,status',
//     requestBody: {
//       snippet: {
//         title: metadata.title,
//         description: metadata.description || '',
//         tags: metadata.tagList,
//         categoryId: '22'
//       },
//       status: {
//         privacyStatus: metadata.privacyStatus || 'public',
//         selfDeclaredMadeForKids: false
//       }
//     },
//     media: {
//       body: fs.createReadStream(videoPath)
//     }
//   });
// }

// // Controller Functions
// exports.getAuthUrl = (req, res) => {
//   const { accountId } = req.params;
//   const { CLIENT_ID , REDIRECT_URI , CLIENT_SECRET } = req.body 
//   console.log("--1")
//   console.log( "auth url" ,CLIENT_ID,REDIRECT_URI,CLIENT_SECRET)
  
//   try {
//     const { oauth2Client } = getOAuthClient(accountId);
//     const authUrl = oauth2Client.generateAuthUrl({
//       access_type: 'offline',
//       scope: SCOPES,
//       prompt: 'consent',
//       include_granted_scopes: true,
//       name : "vaibhav"
//     });
    
//     res.json({ success: true, authUrl, accountId });
//   } catch (error) {
//     res.status(400).json({ success: false, error: error.message });
//   }
// };

// exports.handleCallback = async (req, res) => {
//   const { accountId } = req.params;
//   const { code } = req.query;
//     const { CLIENT_ID , REDIRECT_URI , CLIENT_SECRET } = req.body 
//   console.log("--2")
//   console.log( "callback" ,CLIENT_ID,REDIRECT_URI,CLIENT_SECRET)
  

//   try {
//     const { oauth2Client, TOKEN_PATH } = getOAuthClient(accountId);
//     const { tokens } = await oauth2Client.getToken(code);
    
//     if (!tokens.refresh_token && fs.existsSync(TOKEN_PATH)) {
//       const existingTokens = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
//       tokens.refresh_token = existingTokens.refresh_token;
//     }

//     if (!tokens.refresh_token) {
//       throw new Error('No refresh token received - please reauthenticate');
//     }

//     oauth2Client.setCredentials(tokens);
//     fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
    
//     res.send(`
//       <html><body>
//         <h1>Authentication successful for ${accountId}!</h1>
//         <p>You can close this window.</p>
//         <script>window.close()</script>
//       </body></html>
//     `);
//   } catch (error) {
//     res.status(400).send(`
//       <html><body>
//         <h1>Authentication failed for ${accountId}</h1>
//         <p>${error.message}</p>
//         <p>Please try authenticating again.</p>
//       </body></html>
//     `);
//   }
// };

// exports.uploadVideo = async (req, res) => {
//   const { accountId } = req.params;
//     const { CLIENT_ID , REDIRECT_URI , CLIENT_SECRET } = req.body 
//   console.log("--3")
//   console.log( "upload  video" ,CLIENT_ID,REDIRECT_URI,CLIENT_SECRET)
  
//   const { videoPath, videoUrl, title, description, tags, privacyStatus } = req.body;
//   let localFilePath = videoPath;
//   let shouldCleanup = false;

//   try {
//     // Validate input
//     if (!title || (!videoPath && !videoUrl)) {
//       return res.status(400).json({
//         success: false,
//         error: 'Title and either videoPath or videoUrl are required'
//       });
//     }

//     // Process tags
//     let tagList = [];
//     if (tags) {
//       tagList = typeof tags === 'string' 
//         ? tags.split(',').map(tag => tag.trim()).filter(tag => tag)
//         : tags.map(tag => String(tag).trim()).filter(tag => tag);
      
//       if (tagList.length > 30) {
//         return res.status(400).json({
//           success: false,
//           error: 'Maximum 30 tags allowed'
//         });
//       }
//     }

//     // Handle video URL
//     if (videoUrl) {
//       try {
//         localFilePath = await downloadVideoFromUrl(videoUrl);
//         shouldCleanup = true;
//       } catch (error) {
//         return res.status(400).json({
//           success: false,
//           error: error.message
//         });
//       }
//     }

//     // Check file exists
//     if (!fs.existsSync(localFilePath)) {
//       return res.status(400).json({
//         success: false,
//         error: 'Video file not found',
//         path: localFilePath
//       });
//     }

//     // Get authenticated client
//     const { oauth2Client, TOKEN_PATH } = getOAuthClient(accountId);
    
//     if (!fs.existsSync(TOKEN_PATH)) {
//       return res.status(401).json({
//         success: false,
//         error: 'Account not authenticated',
//         authUrl: oauth2Client.generateAuthUrl({
//           access_type: 'offline',
//           scope: SCOPES,
//           prompt: 'consent'
//         })
//       });
//     }

//     const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
    
//     if (!tokens.refresh_token) {
//       return res.status(401).json({
//         success: false,
//         error: 'No refresh token available - please reauthenticate',
//         authUrl: oauth2Client.generateAuthUrl({
//           access_type: 'offline',
//           scope: SCOPES,
//           prompt: 'consent'
//         })
//       });
//     }

//     oauth2Client.setCredentials(tokens);

//     // Upload to YouTube
//     const response = await uploadToYouTube(oauth2Client, localFilePath, {
//       title,
//       description,
//       tagList,
//       privacyStatus
//     });

//     res.json({
//       success: true,
//       accountId,
//       videoId: response.data.id,
//       title: response.data.snippet.title,
//       url: `https://youtu.be/${response.data.id}`,
//       privacyStatus: response.data.status.privacyStatus
//     });

//   } catch (error) {
//     console.error('Upload Error:', error);
    
//     let errorMessage = error.message;
//     if (error.response?.data?.error) {
//       errorMessage = error.response.data.error.message;
//     }

//     res.status(500).json({
//       success: false,
//       accountId,
//       error: errorMessage,
//       details: error.response?.data,
//       solution: error.message.includes('refresh token') 
//         ? 'Please reauthenticate to get a new refresh token' 
//         : 'Check your request parameters and try again --vaibhav '
//     });
//   } finally {
//     // Clean up temporary file if we downloaded it
//     if (shouldCleanup && localFilePath && fs.existsSync(localFilePath)) {
//       fs.unlinkSync(localFilePath);
//     }
//   }  
// };


const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const stream = require('stream');
const util = require('util');

const pipeline = util.promisify(stream.pipeline);


// Account Configuration
const ACCOUNTS = {  
  account1: {
    CLIENT_ID: process.env.ACC1CLIENT_ID,
    CLIENT_SECRET: process.env.ACC1CLIENT_SECRET,
    REDIRECT_URI: 'http://localhost:5003/api/callback/account1'
    // REDIRECT_URI: 'https://meta.ritaz.in/api/callback/account1'
  }, 
  account2: {
    CLIENT_ID: process.env.ACC2CLIENT_ID,
    CLIENT_SECRET: process.env.ACC2CLIENT_SECRET,   
    REDIRECT_URI: 'https://meta.ritaz.in/api/callback/account2'
    // REDIRECT_URI: 'http://localhost:5003/api/callback/account2'
  },
  account3: {
    CLIENT_ID: process.env.ACC3CLIENT_ID,
    CLIENT_SECRET: process.env.ACC3CLIENT_SECRET,
    // REDIRECT_URI: 'http://localhost:5003/api/callback/account3'
    REDIRECT_URI: 'https://meta.ritaz.in/api/callback/account3'
  },
  account4: {
    CLIENT_ID: process.env.ACC4CLIENT_ID,
    CLIENT_SECRET: process.env.ACC4CLIENT_SECRET,
    REDIRECT_URI: 'https://meta.ritaz.in/api/callback/account4',
    // REDIRECT_URI: 'http://localhost:5003/api/callback/account4'
  }
};

const SCOPES = ['https://www.googleapis.com/auth/youtube.upload'];
const TOKENS_DIR = path.join(__dirname, '../tokens');
const TEMP_DIR = path.join(__dirname, '../temp');

// Create directories if they don't exist
[TOKENS_DIR, TEMP_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

function getOAuthClient(accountId , CLIENT_ID , REDIRECT_URI , CLIENT_SECRET) {
  const account = ACCOUNTS[accountId];
  if (!account) {
    throw new Error(`Account ${accountId} not configured`);
  }

  const TOKEN_PATH = path.join(TOKENS_DIR, `${accountId}_token.json`);
  const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );

  oauth2Client.on('tokens', (tokens) => {
    if (tokens.refresh_token) {
      const currentTokens = fs.existsSync(TOKEN_PATH) 
        ? JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'))
        : {};
      fs.writeFileSync(TOKEN_PATH, JSON.stringify({ ...currentTokens, ...tokens }));
    }
  });

  return { oauth2Client, TOKEN_PATH };
}

async function downloadVideoFromUrl(videoUrl) {
  const tempFilePath = path.join(TEMP_DIR, `video-${Date.now()}${path.extname(videoUrl) || '.mp4'}`);
  const writer = fs.createWriteStream(tempFilePath);

  try {
    const response = await axios({
      method: 'GET',
      url: videoUrl,
      responseType: 'stream',
      timeout: 30000 // 30 seconds timeout
    });

    await pipeline(response.data, writer);
    return tempFilePath;
  } catch (error) {
    // Clean up if download fails
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    throw new Error(`Failed to download video from URL: ${error.message}`);
  }
}

async function uploadToYouTube(oauth2Client, videoPath, metadata) {
  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
  
  return youtube.videos.insert({
    part: 'snippet,status',
    requestBody: {
      snippet: {
        title: metadata.title,
        description: metadata.description || '',
        tags: metadata.tagList,
        categoryId: '22'
      },
      status: {
        privacyStatus: metadata.privacyStatus || 'public',
        selfDeclaredMadeForKids: false
      }
    },
    media: {
      body: fs.createReadStream(videoPath)
    }
  });
}

// Controller Functions
exports.getAuthUrl = (req, res) => {
  const { accountId } = req.params;
  const { CLIENT_ID , REDIRECT_URI , CLIENT_SECRET } = req.body 
  console.log("--1")
  console.log( "auth url" ,CLIENT_ID,REDIRECT_URI,CLIENT_SECRET)
  
  try {
    const { oauth2Client } = getOAuthClient(accountId);
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent',
      include_granted_scopes: true,
      name : "vaibhav"
    });
    
    res.json({ success: true, authUrl, accountId });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// exports.handleCallback = async (req, res) => {
//   const { accountId } = req.params;
//   const { code } = req.query;
//     const { CLIENT_ID , REDIRECT_URI , CLIENT_SECRET } = req.body 
//   console.log("--2", req.body )
//   console.log( "callback" ,CLIENT_ID,REDIRECT_URI,CLIENT_SECRET)
  

//   try {
//     const { oauth2Client, TOKEN_PATH } = getOAuthClient(accountId , CLIENT_ID , REDIRECT_URI , CLIENT_SECRET);
//     const { tokens } = await oauth2Client.getToken(code);
    
//     if (!tokens.refresh_token && fs.existsSync(TOKEN_PATH)) {
//       const existingTokens = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
//       tokens.refresh_token = existingTokens.refresh_token;
//     }

//     if (!tokens.refresh_token) {
//       throw new Error('No refresh token received - please reauthenticate');
//     }

//     oauth2Client.setCredentials(tokens);
//     fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
    
//     res.send(`
//       <html><body>
//         <h1>Authentication successful for ${accountId}!</h1>
//         <p>You can close this window.</p>
//         <script>window.close()</script>
//       </body></html>
//     `);
//   } catch (error) {
//     res.status(400).send(`
//       <html><body>
//         <h1>Authentication failed for ${accountId}</h1>
//         <p>${error.message}</p>
//         <p>Please try authenticating again.</p>
//       </body></html>
//     `);
//   }
// };


exports.handleCallback = async (req, res) => {
  const { accountId } = req.params;
  const { code } = req.query;
  
  // Get credentials from ACCOUNTS configuration instead of req.body
  const account = ACCOUNTS[accountId];
  if (!account) {
    return res.status(400).send(`
      <html><body>
        <h1>Authentication failed</h1>
        <p>Account ${accountId} not configured</p>
      </body></html>
    `);
  }

  const { CLIENT_ID, REDIRECT_URI, CLIENT_SECRET } = account;
  console.log("--2 Callback for account:", accountId);
  console.log("Using credentials:", { CLIENT_ID, REDIRECT_URI, CLIENT_SECRET });

  try {
    const { oauth2Client, TOKEN_PATH } = getOAuthClient(accountId, CLIENT_ID, REDIRECT_URI, CLIENT_SECRET);
    const { tokens } = await oauth2Client.getToken(code);
    
    if (!tokens.refresh_token && fs.existsSync(TOKEN_PATH)) {
      const existingTokens = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
      tokens.refresh_token = existingTokens.refresh_token;
    }

    if (!tokens.refresh_token) {
      throw new Error('No refresh token received - please reauthenticate');
    }

    oauth2Client.setCredentials(tokens);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
    
    res.send(`
      <html><body>
        <h1>Authentication successful for ${accountId}!</h1>
        <p>You can close this window.</p>
        <script>window.close()</script>
      </body></html>
    `);
  } catch (error) {
    res.status(400).send(`
      <html><body>
        <h1>Authentication failed for ${accountId}</h1>
        <p>${error.message}</p>
        <p>Please try authenticating again.</p>
      </body></html>
    `);
  }
};

exports.uploadVideo = async (req, res) => {
  const { accountId } = req.params;
    const { CLIENT_ID , REDIRECT_URI , CLIENT_SECRET } = req.body 
  console.log("--3")
  console.log( "upload  video" ,CLIENT_ID,REDIRECT_URI,CLIENT_SECRET)
  
  const { videoPath, videoUrl, title, description, tags, privacyStatus } = req.body;
  let localFilePath = videoPath;
  let shouldCleanup = false;

  try {
    // Validate input
    if (!title || (!videoPath && !videoUrl)) {
      return res.status(400).json({
        success: false,
        error: 'Title and either videoPath or videoUrl are required'
      });
    }

    // Process tags
    let tagList = [];
    if (tags) {
      tagList = typeof tags === 'string' 
        ? tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : tags.map(tag => String(tag).trim()).filter(tag => tag);
      
      if (tagList.length > 30) {
        return res.status(400).json({
          success: false,
          error: 'Maximum 30 tags allowed'
        });
      }
    }

    // Handle video URL
    if (videoUrl) {
      try {
        localFilePath = await downloadVideoFromUrl(videoUrl);
        shouldCleanup = true;
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }
    }

    // Check file exists
    if (!fs.existsSync(localFilePath)) {
      return res.status(400).json({
        success: false,
        error: 'Video file not found',
        path: localFilePath
      });
    }

    // Get authenticated client
    const { oauth2Client, TOKEN_PATH } = getOAuthClient(accountId , CLIENT_ID , REDIRECT_URI , CLIENT_SECRET);
    
    if (!fs.existsSync(TOKEN_PATH)) {
      return res.status(401).json({
        success: false,
        error: 'Account not authenticated',
        authUrl: oauth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: SCOPES,
          prompt: 'consent'
        })
      });
    }

    const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
    
    if (!tokens.refresh_token) {
      return res.status(401).json({
        success: false,
        error: 'No refresh token available - please reauthenticate',
        authUrl: oauth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: SCOPES,
          prompt: 'consent'
        })
      });
    }

    oauth2Client.setCredentials(tokens);

    // Upload to YouTube
    const response = await uploadToYouTube(oauth2Client, localFilePath, {
      title,
      description,
      tagList,
      privacyStatus
    });

    res.json({
      success: true,
      accountId,
      videoId: response.data.id,
      title: response.data.snippet.title,
      url: `https://youtu.be/${response.data.id}`,
      privacyStatus: response.data.status.privacyStatus
    });

  } catch (error) {
    console.error('Upload Error:', error);
    
    let errorMessage = error.message;
    if (error.response?.data?.error) {
      errorMessage = error.response.data.error.message;
    }

    res.status(500).json({
      success: false,
      accountId,
      error: errorMessage,
      details: error.response?.data,
      solution: error.message.includes('refresh token') 
        ? 'Please reauthenticate to get a new refresh token' 
        : 'Check your request parameters and try again --vaibhav '
    });
  } finally {
    // Clean up temporary file if we downloaded it
    if (shouldCleanup && localFilePath && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
  }  
};
