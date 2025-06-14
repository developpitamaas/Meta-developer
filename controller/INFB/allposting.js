const axios = require("axios");
const Content = require("../../model/facebook/story");
const sharp = require('sharp');
const FormData = require('form-data'); // Node.js FormData alternative
const fs = require('fs');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyC173q3386aM6I6clEXS2ED_F4eEtgcPQw");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });




const lightenColor = (color, percent) => { 
  return {
    r: Math.min(255, color.r + Math.round(255 * (percent/100))),
    g: Math.min(255, color.g + Math.round(255 * (percent/100))),
    b: Math.min(255, color.b + Math.round(255 * (percent/100))) 
  };
};  
const postSmallImageWithPadding = async (Fb_ID, ACCESS_TOKEN, PHOTO_URL) => {
  try {
    // 1. Download image
    const response = await axios.get(PHOTO_URL, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data);  
 
    // Create version without padding for color analysis 
    const analysisImage = await sharp(imageBuffer)
      .resize(800, 800) // Optimal size for analysis
      .toBuffer();
    
    let colors = {
      color1: { r: 100, g: 200, b: 255 }, // Default blue
      color2: { r: 200, g: 255, b: 100 }  // Default gree['n
    };  
    
    try {
      const image = { 
        inlineData: { 
          data: analysisImage.toString("base64"),
          mimeType: 'image/jpeg', 
        }, 
      };
      
      // Neutral prompt without color bias
      const prompt = `Analyze the actual visual content of this image and identify the TWO most dominant RGB colors. 
                      Consider only the main subject and foreground elements. 
                      Ignore any borders, backgrounds, padding, or potential artifacts. 
                      Return ONLY valid JSON in this exact format: 
                      {
                        "color1": {"r": number, "g": number, "b": number},
                        "color2": {"r": number, "g": number, "b": number}
                      }
                      Do not include any additional text or explanations.`;
      
      const result = await model.generateContent([prompt, image]);
      const responseText = result.response.text().trim();
      
      // Clean response and parse JSON
      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}') + 1;
      const jsonString = responseText.substring(jsonStart, jsonEnd);
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const parsed = JSON.parse(jsonString);
        if (parsed.color1 && parsed.color2) {
          colors = parsed;
          
          // Lighten colors (30% lighter)
          colors.color1 = lightenColor(colors.color1, 30);
          colors.color2 = lightenColor(colors.color2, 30);
          
          console.log("Detected colors:", colors);
        }
      }
    } catch (aiError) {
      console.error("AI Color Analysis Error:", aiError.message);
      // Neutral fallback colors (blue/green gradient)
      colors = {
        color1: { r: 100, g: 200, b: 255 },
        color2: { r: 200, g: 255, b: 100 }
      };
    }

    // Create padded version for final composition
    const paddedImage = await sharp(imageBuffer)
      .resize({ 
        width: 950,
        height: 1200,
        fit: 'cover',
        background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
      })
      .toBuffer();

    // Create gradient SVG with blur effect
    const gradientSvg = Buffer.from(`
      <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="blur" x="0" y="0">
            <feGaussianBlur in="SourceGraphic" stdDeviation="20" />
          </filter>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="rgb(${colors.color1.r}, ${colors.color1.g}, ${colors.color1.b})"/>
            <stop offset="100%" stop-color="rgb(${colors.color2.r}, ${colors.color2.g}, ${colors.color2.b})"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)" filter="url(#blur)"/>
      </svg>
    `);

    // Create final composition
    const finalImage = await sharp(gradientSvg)
      .composite([{ 
        input: paddedImage,
        gravity: 'center',
        blend: 'over' 
      }])
      .jpeg({ quality: 90 })
      .toBuffer();

    // Facebook posting
    const form = new FormData();
    form.append('source', finalImage, { filename: 'fb-story.jpg' });
    form.append('published', 'false');
    form.append('access_token', ACCESS_TOKEN);

    const uploadResponse = await axios.post(
      `https://graph.facebook.com/v19.0/${Fb_ID}/photos`,
      form,
      { headers: { ...form.getHeaders() } }
    );
 
    await axios.post(
      `https://graph.facebook.com/v20.0/${Fb_ID}/photo_stories`,
      { photo_id: uploadResponse.data.id, access_token: ACCESS_TOKEN }
    );

    console.log("Story posted with accurate color gradient!");
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    throw error; // Rethrow for better error handling upstream
  }
}; 


// const postToImageStoryFacebook = async (Fb_ID, ACCESS_TOKEN, PHOTO_URL) => {
//   try {
    
//     console.log("stated");
//     const uploadResponse = await axios.post(
//       `https://graph.facebook.com/v19.0/${Fb_ID}/photos`,
//       {
//         url: PHOTO_URL,
//         published: false,
//         access_token: ACCESS_TOKEN,
//       }
//     );

//     console.log("First step done", uploadResponse);
//     const photoId = uploadResponse.data.id;
//     const data = await axios.post(
//       `https://graph.facebook.com/v20.0/${Fb_ID}/photo_stories`,
//       {
//         photo_id: photoId,
//         access_token: ACCESS_TOKEN,
//       }
//     );

//     console.log("Facebook story posted successfully!", data);
//   } catch (error) {
//     console.error(
//       "Error posting story to Facebook:",
//       error.response ? error.response.data : error.message
//     );
//   }
// };


// const postSmallImageWithPadding = async (Fb_ID, ACCESS_TOKEN, PHOTO_URL) => {
//   try {
//     const response = await axios.get(PHOTO_URL, { responseType: 'arraybuffer' });
//     const imageBuffer = Buffer.from(response.data);
//     const targetWidth = 1080; 
//     const targetHeight = 1920; 

//     const processedImage = await sharp(imageBuffer)
//       .resize({
//         width: targetWidth,
//         height: targetHeight,
//         fit: 'cover',
//         position: 'center'
//       })
//       .jpeg()
//       .toBuffer();

//     const form = new FormData();
//     form.append('source', processedImage, { filename: 'fb-story.jpg' });
//     form.append('published', 'false');
//     form.append('access_token', ACCESS_TOKEN);

//     const uploadResponse = await axios.post(
//       `https://graph.facebook.com/v19.0/${Fb_ID}/photos`,
//       form,
//       { headers: { ...form.getHeaders() } }
//     ); 

//     await axios.post(
//       `https://graph.facebook.com/v20.0/${Fb_ID}/photo_stories`,
//       { photo_id: uploadResponse.data.id, access_token: ACCESS_TOKEN }
//     );

//   } catch (error) {
//     console.error("Error:", error.response?.data || error.message);
//   }
// };
















const postVideoStoryToFacebook = async (Fb_ID, ACCESS_TOKEN, PHOTO_URL) => {
  try {
    console.log("Starting video story upload to Facebook");

    // Step 1: Start the upload process
    const startResponse = await axios.post(
      `https://graph.facebook.com/${Fb_ID}/video_stories?upload_phase=start&access_token=${ACCESS_TOKEN}`
    );
    const { video_id, upload_url } = startResponse.data;
    console.log("Video story upload started:", video_id, upload_url);

    // Wait for 30 seconds after Step 1
    await new Promise((resolve) => setTimeout(resolve, 30000));

    // Step 2: Upload the video file
    const uploadResponse = await axios.post(upload_url, null, {
      headers: {
        Authorization: `OAuth ${ACCESS_TOKEN}`,
        file_url: PHOTO_URL,
      },
      params: {
        file_url: PHOTO_URL,
      },
    });
    console.log("Video file uploaded:", uploadResponse.data);

    // Wait for 30 seconds after Step 2
    await new Promise((resolve) => setTimeout(resolve, 30000));

    // Step 3: Finish the upload
    const finishResponse = await axios.post(
      `https://graph.facebook.com/${Fb_ID}/video_stories?upload_phase=finish&video_id=${video_id}&access_token=${ACCESS_TOKEN}`
    );

    console.log("Video story upload finished:", finishResponse.data);
  } catch (error) {
    console.error(
      "Error posting video story to Facebook:",
      error.response ? error.response.data : error.message
    );
  } 
};

const postToFacebookReels = async (Fb_ID, ACCESS_TOKEN, PHOTO_URL, message) => { 
  try {
    console.log("Posting video to Facebook Page");

    // First upload and publish the video
    const uploadResponse = await axios.post(
      `https://graph.facebook.com/v20.0/${Fb_ID}/videos`,
      {
        file_url: PHOTO_URL, 
        access_token: ACCESS_TOKEN,
        published: true, // Publish it first
        description: "", // Empty description initially
      }
    ); 

    const videoId = uploadResponse.data.id;
    console.log("Video uploaded and published:", videoId);

    // Wait a moment for the video to be processed
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Then update the video with the description
    const updateResponse = await axios.post(
      `https://graph.facebook.com/v20.0/${videoId}`,
      {
        description: message,
        access_token: ACCESS_TOKEN,
      }
    );

    console.log("Video description updated:", updateResponse.data);
    return { videoId, updateResponse: updateResponse.data };

  } catch (error) {
    console.error(
      "Error posting video with message:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};
 

// const postToFacebookReels = async (Fb_ID, ACCESS_TOKEN, PHOTO_URL, message) => { 
//   try {
//     console.log("Posting to Facebook Page feed");

//     // First upload the video
//     const uploadResponse = await axios.post(
//       `https://graph.facebook.com/v20.0/${Fb_ID}/videos`,
//       {
//         file_url: PHOTO_URL, 
//         access_token: ACCESS_TOKEN, 
//       }
//     ); 

//     const videoId = uploadResponse.data.id;
//     console.log("Video uploaded:", videoId);  

//     // Then create a post with the video and message
//     const postResponse = await axios.post(
//       `https://graph.facebook.com/v20.0/${Fb_ID}/feed`,
//       {
//         message: message,
//         link: `https://www.facebook.com/watch/?v=${videoId}`,
//         access_token: ACCESS_TOKEN,
//       }
//     ); 

//     console.log("Post created with video and message:", postResponse.data);
//     return postResponse.data;

//   } catch (error) {
//     console.error(
//       "Error posting video with message:",
//       error.response ? error.response.data : error.message
//     );
//     throw error;
//   }
// };





// const postToFacebookReels = async (Fb_ID, ACCESS_TOKEN, PHOTO_URL,message) => {
//   try {
//     console.log("Starting video upload for Facebook Reels");

//     const startResponse = await axios.post(
//       `https://graph.facebook.com/v20.0/${Fb_ID}/videos`,
//       {
//         upload_phase: "start",
//         access_token: ACCESS_TOKEN, 
//       }
//     );

//     console.log("Upload session started:", startResponse.data);
//     const uploadSessionId = startResponse.data.upload_session_id;

//     const transferResponse = await axios.post(
//       `https://graph.facebook.com/v20.0/${Fb_ID}/videos`,
//       {
//         start_offset: "0", 
//         upload_session_id: uploadSessionId,
//         file_url: PHOTO_URL,
//         access_token: ACCESS_TOKEN,
//       }
//     ); 

//     console.log("Video file transferred:", transferResponse.data);

//     const finishResponse = await axios.post(
//       `https://graph.facebook.com/v20.0/${Fb_ID}/videos`,
//       {
//         upload_phase: "finish", 
//         upload_session_id: uploadSessionId,
//         access_token: ACCESS_TOKEN, 
//         description: message,    
//         caption: message,    
//         message: message,    
//       }
//     );

//     console.log("Video upload finished:", finishResponse.data);

//     const data = await axios.post(
//       `https://graph.facebook.com/v20.0/${Fb_ID}/videos`,
//       {
//         video_id: finishResponse.data.video_id,
//         title: "My Awesome Reel",
//         access_token: ACCESS_TOKEN,
//         message: message,

//       }
//     );

//     console.log("Facebook video posted as Reel:", data);
//   } catch (error) {
//     console.error(
//       "Error posting video to Facebook Reels:",
//       error.response ? error.response.data : error.message
//     );
//   }
// };

// Function to post image story to Instagram
const postToImageStoryInstagram = async (Inst_ID, ACCESS_TOKEN, PHOTO_URL) => {
  try {
    const mediaUrl = `https://graph.facebook.com/v19.0/${Inst_ID}/media`;

    // Post the image to Instagram
    const mediaResponse = await axios.post(mediaUrl, null, {
      params: {
        media_type: "STORIES",
        caption: "Instagram Story",
        image_url: PHOTO_URL,
        access_token: ACCESS_TOKEN,
      },
    });

    const creationId = mediaResponse.data.id;
    console.log(`Step -1 Instagram creation : ${creationId}`);

    const mediaUrlforPost = `https://graph.facebook.com/v19.0/${Inst_ID}/media_publish`;
    // Post the story to Instagram
    const storyResponse = await axios.post(mediaUrlforPost, null, {
      params: {
        creation_id: `${creationId}`,
        access_token: ACCESS_TOKEN,
      },
    });

    const instaResponseId = storyResponse.data.id;
    console.log(`2nd step - Instagram story response ID: ${instaResponseId}`);
  } catch (error) {
    console.error(
      "Error posting story to Instagram:",
      error.response ? error.response.data : error.message
    );
  }
};

// Function to post video story to Instagram

const postToVideoStoryInstagram = async (Inst_ID, ACCESS_TOKEN, PHOTO_URL) => {
  try {
    console.log("Starting video story upload to Instagram");

    // Step 1: Send video URL to initiate the story upload
    const mediaResponse = await axios.post(
      `https://graph.facebook.com/v20.0/${Inst_ID}/media`,
      null,
      {
        params: {
          media_type: "STORIES",
          video_url: PHOTO_URL,
          access_token: ACCESS_TOKEN,
        },
      }
    );

    const creationId = mediaResponse.data.id;
    console.log("Video story upload started. Creation ID:", creationId);

    // Wait for 10 seconds before calling Step 2 API
    await new Promise((resolve) => setTimeout(resolve, 90000));

    // Step 2: Publish the story using the creation ID
    const publishResponse = await axios.post(
      `https://graph.facebook.com/v20.0/${Inst_ID}/media_publish`,
      null,
      {
        params: {
          creation_id: creationId,
          access_token: ACCESS_TOKEN,
        },
      }
    );

    console.log(
      "Instagram video story posted successfully!",
      publishResponse.data
    );
  } catch (error) {
    console.error(
      "Error posting video story to Instagram:",
      error.response ? error.response.data : error.message
    );
  }
};

// Function to post image on feed to Facebook
const postToImageFeedFacebook = async (
  Fb_ID,
  ACCESS_TOKEN,
  PHOTO_URL,
  message
) => {
  console.log("Post image on feed");
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v19.0/${Fb_ID}/photos`,
      {
        url: PHOTO_URL,
        access_token: ACCESS_TOKEN,
        message: message,
      }
    );
    console.log("First step done");
  } catch (error) {
    console.error(
      "Error posting story to Facebook:",
      error.response ? error.response.data : error.message
    );
  }
};

// Function to post image feed to Instagram
const postToImageFeedInstagram = async (
  Inst_ID,
  ACCESS_TOKEN,
  PHOTO_URL,
  message
) => {
  console.log("Insta post");
  try {
    const mediaUrl = `https://graph.facebook.com/v19.0/${Inst_ID}/media`;

    // Post the image to Instagram
    const mediaResponse = await axios.post(mediaUrl, null, {
      params: {
        image_url: PHOTO_URL,
        access_token: ACCESS_TOKEN,
        caption: message,
      },
    });

    const creationId = mediaResponse.data.id;
    console.log(`Step -1 Instagram creation : ${creationId}`);

    const mediaUrlforPost = `https://graph.facebook.com/v19.0/${Inst_ID}/media_publish`;
    // Post the story to Instagram
    const storyResponse = await axios.post(mediaUrlforPost, null, {
      params: {
        creation_id: `${creationId}`,
        access_token: ACCESS_TOKEN,
      },
    });

    const instaResponseId = storyResponse.data.id;
    console.log(`2nd step - Instagram story response ID: ${instaResponseId}`);
  } catch (error) {
    console.error(
      "Error posting story to Instagram:",
      error.response ? error.response.data : error.message
    );
  }
};

// instgram reel

const postReelToInstagram = async (Inst_ID, ACCESS_TOKEN, PHOTO_URL,message) => {
  try {
    console.log("Starting Instagram reel upload");

    // Step 1: Send video URL to initiate the reel upload
    const mediaResponse = await axios.post(
      `https://graph.facebook.com/v20.0/${Inst_ID}/media`,
      null,
      { 
        params: {
          media_type: "REELS",
          video_url: PHOTO_URL,
          access_token: ACCESS_TOKEN,
          caption:  message
        },
      }
    );

    const creationId = mediaResponse.data.id;
    console.log("Reel upload started. Creation ID:", creationId);

    // Wait for 60 seconds after Step 1
    await new Promise((resolve) => setTimeout(resolve, 60000));

    // Step 2: Publish the reel using the creation ID
    const publishResponse = await axios.post(
      `https://graph.facebook.com/v20.0/${Inst_ID}/media_publish`,
      null,
      {
        params: {
          creation_id: creationId,
          access_token: ACCESS_TOKEN,
        },
      }
    );

    console.log("Instagram reel posted successfully!");
  } catch (error) {
    console.error(
      "Error posting reel to Instagram:",
      error.response ? error.response.data : error.message
    );
  }
};


const activeTimers = new Map();

async function schedulePosts() {
  // Clear any existing timers
  clearAllScheduledPosts();

  const data = await Content.find();

  data.forEach(
    ({
      _id,
      Fb_ID,
      message,   
      Inst_ID,
      ACCESS_TOKEN,
      PHOTO_URL, 
      unixtime, 
      for: platforms,
      isUpcoming
    }) => {
      // Skip if post is not upcoming
      if (isUpcoming === false) return;

      const delay = unixtime * 1000 - Date.now();  
      if (delay > 0) { 
        const timerId = setTimeout(() => { 
          if (platforms.includes("facebook-story-image")) { 
            console.log("FB story");  
            // postToImageStoryFacebook(Fb_ID, ACCESS_TOKEN, PHOTO_URL);
            postSmallImageWithPadding(Fb_ID, ACCESS_TOKEN, PHOTO_URL);
          } 
          if (platforms.includes("facebook-Feed-image")) { 
            console.log("FB post");  
            postToImageFeedFacebook(Fb_ID, ACCESS_TOKEN, PHOTO_URL, message); 
          } 
          if (platforms.includes("facebook-Feed-video")) {
            console.log("FB video post");
            postToFacebookReels(Fb_ID, ACCESS_TOKEN, PHOTO_URL,message);
          }
          if (platforms.includes("facebook-story-video")) {
            console.log("Posting Facebook video story");
            postVideoStoryToFacebook(Fb_ID, ACCESS_TOKEN, PHOTO_URL,message);
          }

          // Instagram
          // if (platforms.includes("instagram-story-image")) {
          //   console.log("Insta story");
          //   postToImageStoryInstagram(Inst_ID, ACCESS_TOKEN, PHOTO_URL);
          // }
          if (platforms.includes("instagram-Feed-image")) {
            console.log("Insta post");
            postToImageFeedInstagram(
              Inst_ID,
              ACCESS_TOKEN,
              PHOTO_URL,
              message
            );
          }
          if (platforms.includes("instagram-story-video")) {
            postToVideoStoryInstagram(Inst_ID, ACCESS_TOKEN, PHOTO_URL);
          }
          if (platforms.includes("instagram-Feed-video")) {
            postReelToInstagram(Inst_ID, ACCESS_TOKEN, PHOTO_URL,message);
          }

          // Remove the timer from activeTimers after execution
          activeTimers.delete(_id);
        }, delay);

        // Store the timer with the post _id as key
        activeTimers.set(_id, timerId);
      }
    }
  );
}

function clearAllScheduledPosts() {
  // Clear all active timers
  for (const [_, timerId] of activeTimers) {
    clearTimeout(timerId);
  }
  activeTimers.clear();
}
// schedulePosts();
module.exports = { schedulePosts };
