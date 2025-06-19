const YtPost = require('../../model/YT/ytvideo');
const { google } = require('googleapis');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const TOKENS_DIR = path.join(__dirname, '../tokens');
const TEMP_DIR = path.join(__dirname, '../temp');
const activeYouTubeTimers = new Map();
const TOKEN_EXPIRY_BUFFER = 300000; 

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
  if (tokens.expiry_date && now < tokens.expiry_date - TOKEN_EXPIRY_BUFFER) {
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

async function uploadYouTubeVideo(post) {
  try {
    // Get tokens from local storage
    const tokens = await getOrRefreshToken(post.account, post.CLIENT_ID, post.CLIENT_SECRET, post.REDIRECT_URI);
    if (!tokens) {
      throw new Error('No valid tokens available for this account');
    }

    const oauth2Client = new google.auth.OAuth2(
      post.CLIENT_ID,
      post.CLIENT_SECRET,
      post.REDIRECT_URI
    );
    oauth2Client.setCredentials(tokens);

    const youtube = google.youtube({
      version: "v3",
      auth: oauth2Client,
    });

    // Download the video file with timeout
    const tempFilePath = path.join(TEMP_DIR, `temp_video_${Date.now()}.mp4`);
    const writer = fs.createWriteStream(tempFilePath);

    const response = await axios({
      method: 'get',
      url: post.videoUrl,
      responseType: 'stream',
      timeout: 30000 // 30 seconds timeout
    });

    await new Promise((resolve, reject) => {
      response.data.pipe(writer);
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    // Upload the video with progress tracking
    const uploadResponse = await youtube.videos.insert({
      part: "snippet,status",
      requestBody: {
        snippet: {
          title: post.title,
          description: post.description,
          tags: post.tags || [],
        },
        status: {
          privacyStatus: post.privacyStatus || "public",
          // publishAt: new Date(parseInt(post.unixtime) * 1000).toISOString(),
        },
      },
      media: {
        body: fs.createReadStream(tempFilePath),
      },
    });

    // Clean up temp file
    fs.unlinkSync(tempFilePath);

    // Update post status
    post.youtubeVideoId = uploadResponse.data.id;
    post.status = "published";
    post.publishedAt = new Date();
    await post.save();

    console.log(`YouTube video uploaded successfully: ${uploadResponse.data.id}`);
    return uploadResponse.data;
  } catch (error) {
    console.error("Error uploading YouTube video:", error);
    
    // Clean up temp file if it exists
    const tempFilePath = path.join(TEMP_DIR, `temp_video_${Date.now()}.mp4`);
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }

    post.status = "failed";
    post.lastError = error.message;
    await post.save();
    
    throw error;
  }
}


async function scheduleYouTubePosts() {
  try {
    // Clear any existing timers
    clearAllScheduledYouTubePosts();

    // Get all posts with future unixtime (within next 30 days)
    const now = Math.floor(Date.now() / 1000);
    const futureLimit = now + (30 * 24 * 60 * 60); // 30 days in future
    
    const posts = await YtPost.find({
      unixtime: { 
        $gte: now.toString(), 
        $lte: futureLimit.toString() 
      },
    }).sort({ unixtime: 1 }); // Sort by earliest first

    console.log(`Found ${posts.length} posts to schedule`);
 
    for (const post of posts) { 
      try {
        const tokenPath = getTokenPath(post.account);
        
        // Check if token exists
        if (!fs.existsSync(tokenPath)) {
          console.log(`No token found for account ${post.account}`);
          post.status = "needs_authorization";
          await post.save();
          continue;
        }

        // Read token from file
        const tokens = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
        console.log(`Using token for account ${post.account}`);

        // Calculate delay until scheduled time
        const scheduledTime = parseInt(post.unixtime) * 1000;
        const delay = scheduledTime - Date.now();

        if (delay > 0) {
          console.log(`Scheduling post ${post._id} for ${new Date(scheduledTime)}`);
          
          const timerId = setTimeout(async () => {
            try {
              console.log(`Processing scheduled post ${post._id}`);
              await uploadYouTubeVideo(post);
            } catch (error) {
              console.error(`Failed to upload YouTube video ${post._id}:`, error);
            } finally {
              activeYouTubeTimers.delete(post._id);
            }
          }, delay);

          activeYouTubeTimers.set(post._id, timerId);
          post.status = "scheduled";
          await post.save();
        } else {
          console.log(`Post ${post._id} scheduled time has passed, attempting immediate upload`);
          try {
            await uploadYouTubeVideo(post);
          } catch (error) {
            console.error(`Failed to upload delayed post ${post._id}:`, error);
          } 
        }
      } catch (error) {
        console.error(`Error processing post ${post._id}:`, error);
      }
    }
  } catch (error) {
    console.error("Error in scheduleYouTubePosts:", error);
  }
}



function clearAllScheduledYouTubePosts() {
  for (const [_, timerId] of activeYouTubeTimers) {
    clearTimeout(timerId);
  }
  activeYouTubeTimers.clear();
  console.log("Cleared all scheduled YouTube posts");
}

module.exports = { 
  scheduleYouTubePosts,
  clearAllScheduledYouTubePosts
};