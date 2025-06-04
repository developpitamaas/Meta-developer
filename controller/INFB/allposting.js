const axios = require("axios");
const Content = require("../../model/facebook/story");

// Function to post image story to Facebook
const postToImageStoryFacebook = async (Fb_ID, ACCESS_TOKEN, PHOTO_URL) => {
  try {
    console.log("stated");
    const uploadResponse = await axios.post(
      `https://graph.facebook.com/v19.0/${Fb_ID}/photos`,
      {
        url: PHOTO_URL,
        published: false,
        access_token: ACCESS_TOKEN,
      }
    );

    console.log("First step done", uploadResponse);
    const photoId = uploadResponse.data.id;
    const data = await axios.post(
      `https://graph.facebook.com/v20.0/${Fb_ID}/photo_stories`,
      {
        photo_id: photoId,
        access_token: ACCESS_TOKEN,
      }
    );

    console.log("Facebook story posted successfully!", data);
  } catch (error) {
    console.error(
      "Error posting story to Facebook:",
      error.response ? error.response.data : error.message
    );
  }
};

// Function to post video story to Facebook

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

const postToFacebookReels = async (Fb_ID, ACCESS_TOKEN, PHOTO_URL) => {
  try {
    console.log("Starting video upload for Facebook Reels");

    // Step 1: Start the upload session
    const startResponse = await axios.post(
      `https://graph.facebook.com/v20.0/${Fb_ID}/videos`,
      {
        upload_phase: "start",
        access_token: ACCESS_TOKEN,
      }
    );

    console.log("Upload session started:", startResponse.data);
    const uploadSessionId = startResponse.data.upload_session_id;

    // Step 2: Transfer the video file
    const transferResponse = await axios.post(
      `https://graph.facebook.com/v20.0/${Fb_ID}/videos`,
      {
        start_offset: "0", // This should be adjusted if using chunks
        upload_session_id: uploadSessionId,
        file_url: PHOTO_URL, // URL of the video file to be uploaded
        access_token: ACCESS_TOKEN,
      }
    );

    console.log("Video file transferred:", transferResponse.data);

    // Step 3: Finish the upload
    const finishResponse = await axios.post(
      `https://graph.facebook.com/v20.0/${Fb_ID}/videos`,
      {
        upload_phase: "finish",
        upload_session_id: uploadSessionId,
        access_token: ACCESS_TOKEN,
      }
    );

    console.log("Video upload finished:", finishResponse.data);

    // Step 4: Here you can try to apply a category, title, description, etc., that targets Reels
    // For example, we can just post it to the page and hope Facebook auto-categorizes it
    const data = await axios.post(
      `https://graph.facebook.com/v20.0/${Fb_ID}/videos`,
      {
        video_id: finishResponse.data.video_id,
        title: "My Awesome Reel", // You can give it a title
        description: "Check out my amazing reel!", // Optional description
        access_token: ACCESS_TOKEN,
      }
    );

    console.log("Facebook video posted as Reel:", data);
  } catch (error) {
    console.error(
      "Error posting video to Facebook Reels:",
      error.response ? error.response.data : error.message
    );
  }
};

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

const postReelToInstagram = async (Inst_ID, ACCESS_TOKEN, PHOTO_URL) => {
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

    console.log("Instagram reel posted successfully!", publishResponse.data);
  } catch (error) {
    console.error(
      "Error posting reel to Instagram:",
      error.response ? error.response.data : error.message
    );
  }
};

// Function to schedule the posts
// const schedulePosts = async () => {
//   console.log("stated");
//   try {
//     const posts = await Content.find();
//     posts.forEach(
//       ({
//         Fb_ID,
//         message,
//         Inst_ID,
//         ACCESS_TOKEN,
//         PHOTO_URL,
//         unixtime,
//         for: platforms,
//       }) => {
//         const delay = unixtime * 1000 - Date.now();
//         if (delay > 0) {
//           setTimeout(() => {
//             // Facebook
            // if (platforms.includes("facebook-story-image")) {
            //   console.log("FB story");
            //   postToImageStoryFacebook(Fb_ID, ACCESS_TOKEN, PHOTO_URL);
            // }
            // if (platforms.includes("facebook-Feed-image")) {
            //   console.log("FB post");
            //   postToImageFeedFacebook(Fb_ID, ACCESS_TOKEN, PHOTO_URL, message);
            // }
            // if (platforms.includes("facebook-Feed-video")) {
            //   console.log("FB vidoe post");
            //   postToFacebookReels(Fb_ID, ACCESS_TOKEN, PHOTO_URL);
            // }
            // if (platforms.includes("facebook-story-video")) {
            //   console.log("Posting Facebook video story");
            //   postVideoStoryToFacebook(Fb_ID, ACCESS_TOKEN, PHOTO_URL);
            // }

            // // Instagram
            // if (platforms.includes("instagram-story-image")) {
            //   console.log("Insta story");
            //   postToImageStoryInstagram(Inst_ID, ACCESS_TOKEN, PHOTO_URL);
            // }
            // if (platforms.includes("instagram-Feed-image")) {
            //   console.log("Insta post");
            //   postToImageFeedInstagram(
            //     Inst_ID,
            //     ACCESS_TOKEN,
            //     PHOTO_URL,
            //     message
            //   );
            // }
            // if (platforms.includes("instagram-story-video")) {
            //   postToVideoStoryInstagram(Inst_ID, ACCESS_TOKEN, PHOTO_URL);
            // }
            // if (platforms.includes("instagram-Feed-video")) {
            //   postReelToInstagram(Inst_ID, ACCESS_TOKEN, PHOTO_URL);
            // }
//           }, delay);
//         }
//       }
//     );
//   } catch (error) {
//     console.error("Error fetching posts from MongoDB:", error);
//   }
// };
async function schedulePosts() {
  const data = await Content.find();
  console.log(data)
  data.forEach(
    ({
      Fb_ID,
      message,   
      Inst_ID,
      ACCESS_TOKEN,
      PHOTO_URL, 
      unixtime, 
      for: platforms,
    }) => {
      const delay = unixtime * 1000 - Date.now(); 
      if (delay > 0) {
        setTimeout(() => {
          // if (platforms.includes("facebook-story-image")) {
          //   console.log("fb story");
          //   postToImageStoryFacebook(Fb_ID, ACCESS_TOKEN, PHOTO_URL);
          // }
          // if (platforms.includes("facebook-Feed-image")) {
          //   console.log("fb post");

          //   postToImageFeedFacebook(Fb_ID, ACCESS_TOKEN, PHOTO_URL, message);
          // }
          // if (platforms.includes("instagram-story-image")) {
          //   console.log("insta story");

          //   postToImageStoryInstagram(Inst_ID, ACCESS_TOKEN, PHOTO_URL);
          // }
          // if (platforms.includes("instagram-Feed-image")) {
          //   console.log("insta post");

          //   postToImageFeedInstagram(Inst_ID, ACCESS_TOKEN, PHOTO_URL);
          // }
          if (platforms.includes("facebook-story-image")) {
              console.log("FB story");
              postToImageStoryFacebook(Fb_ID, ACCESS_TOKEN, PHOTO_URL);
            }
            if (platforms.includes("facebook-Feed-image")) {
              console.log("FB post");
              postToImageFeedFacebook(Fb_ID, ACCESS_TOKEN, PHOTO_URL, message);
            }
            if (platforms.includes("facebook-Feed-video")) {
              console.log("FB vidoe post");
              postToFacebookReels(Fb_ID, ACCESS_TOKEN, PHOTO_URL);
            }
            if (platforms.includes("facebook-story-video")) {
              console.log("Posting Facebook video story");
              postVideoStoryToFacebook(Fb_ID, ACCESS_TOKEN, PHOTO_URL);
            }

            // Instagram
            if (platforms.includes("instagram-story-image")) {
              console.log("Insta story");
              postToImageStoryInstagram(Inst_ID, ACCESS_TOKEN, PHOTO_URL);
            }
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
              postReelToInstagram(Inst_ID, ACCESS_TOKEN, PHOTO_URL);
            }
        }, delay);
      }
    }
  );
}

// schedulePosts();
module.exports = { schedulePosts };

// const axios = require("axios");
// const Content = require("../../model/facebook/story");

// // Track active timeouts to prevent memory leaks
// const activeTimeouts = new Map();

// // 1. Facebook Image Story
// const postToImageStoryFacebook = async (Fb_ID, ACCESS_TOKEN, PHOTO_URL) => {
//   try {
//     console.log(`Starting Facebook image story upload for page ${Fb_ID}`);
    
//     // Step 1: Upload image
//     const uploadResponse = await axios.post(
//       `https://graph.facebook.com/v19.0/${Fb_ID}/photos`,
//       {
//         url: PHOTO_URL,
//         published: false,
//         access_token: ACCESS_TOKEN,
//       },
//       { timeout: 30000 }
//     );

//     console.log("Image uploaded:", uploadResponse.data.id);
//     const photoId = uploadResponse.data.id;

//     // Step 2: Create story
//     const storyResponse = await axios.post(
//       `https://graph.facebook.com/v20.0/${Fb_ID}/photo_stories`,
//       {
//         photo_id: photoId,
//         access_token: ACCESS_TOKEN,
//       },
//       { timeout: 30000 }
//     );

//     console.log("Story created:", storyResponse.data.id);
//     return { success: true, id: storyResponse.data.id };
//   } catch (error) {
//     console.error("Facebook story error:", error.response?.data || error.message);
//     return { success: false, error: error.response?.data || error.message };
//   }
// };

// // 2. Facebook Video Story
// const postVideoStoryToFacebook = async (Fb_ID, ACCESS_TOKEN, VIDEO_URL) => {
//   try {
//     console.log(`Starting Facebook video story upload for page ${Fb_ID}`);

//     // Step 1: Initialize upload
//     const initResponse = await axios.post(
//       `https://graph.facebook.com/v20.0/${Fb_ID}/video_stories`,
//       {
//         upload_phase: "start",
//         access_token: ACCESS_TOKEN,
//       },
//       { timeout: 30000 }
//     );

//     const { video_id, upload_url } = initResponse.data;
//     console.log("Upload initialized:", video_id);

//     // Step 2: Upload video
//     await axios.post(
//       upload_url,
//       { file_url: VIDEO_URL },
//       { timeout: 60000, headers: { Authorization: `OAuth ${ACCESS_TOKEN}` } }
//     );

//     // Step 3: Finalize
//     const finishResponse = await axios.post(
//       `https://graph.facebook.com/v20.0/${Fb_ID}/video_stories`,
//       {
//         upload_phase: "finish",
//         video_id: video_id,
//         access_token: ACCESS_TOKEN,
//       },
//       { timeout: 30000 }
//     );

//     console.log("Video story posted:", finishResponse.data.id);
//     return { success: true, id: finishResponse.data.id };
//   } catch (error) {
//     console.error("Facebook video story error:", error.response?.data || error.message);
//     return { success: false, error: error.response?.data || error.message };
//   }
// };

// // 3. Facebook Feed Image
// const postToImageFeedFacebook = async (Fb_ID, ACCESS_TOKEN, PHOTO_URL, caption = "") => {
//   try {
//     console.log(`Posting image to Facebook feed for page ${Fb_ID}`);
    
//     const response = await axios.post(
//       `https://graph.facebook.com/v19.0/${Fb_ID}/photos`,
//       {
//         url: PHOTO_URL,
//         message: caption,
//         access_token: ACCESS_TOKEN,
//       },
//       { timeout: 30000 }
//     );

//     console.log("Feed image posted:", response.data.id);
//     return { success: true, id: response.data.id };
//   } catch (error) {
//     console.error("Facebook feed image error:", error.response?.data || error.message);
//     return { success: false, error: error.response?.data || error.message };
//   }
// };

// // 4. Facebook Reels
// const postToFacebookReels = async (Fb_ID, ACCESS_TOKEN, VIDEO_URL, caption = "") => {
//   try {
//     console.log(`Uploading Reel to Facebook page ${Fb_ID}`);

//     const response = await axios.post(
//       `https://graph.facebook.com/v20.0/${Fb_ID}/video_reels`,
//       {
//         video_url: VIDEO_URL,
//         description: caption,
//         access_token: ACCESS_TOKEN,
//       },
//       { timeout: 60000 }
//     );

//     console.log("Reel posted:", response.data.id);
//     return { success: true, id: response.data.id };
//   } catch (error) {
//     console.error("Facebook Reel error:", error.response?.data || error.message);
//     return { success: false, error: error.response?.data || error.message };
//   }
// };

// // 5. Instagram Image Story
// const postToImageStoryInstagram = async (Inst_ID, ACCESS_TOKEN, PHOTO_URL) => {
//   try {
//     console.log(`Starting Instagram story upload for account ${Inst_ID}`);

//     // Step 1: Create media container
//     const mediaResponse = await axios.post(
//       `https://graph.facebook.com/v19.0/${Inst_ID}/media`,
//       {
//         image_url: PHOTO_URL,
//         media_type: "STORIES",
//         access_token: ACCESS_TOKEN,
//       },
//       { timeout: 30000 }
//     );

//     const creationId = mediaResponse.data.id;
//     console.log("Media container created:", creationId);

//     // Step 2: Poll for status
//     let status = "IN_PROGRESS";
//     while (status === "IN_PROGRESS") {
//       await new Promise(resolve => setTimeout(resolve, 2000));
//       const statusCheck = await axios.get(
//         `https://graph.facebook.com/v19.0/${creationId}`,
//         {
//           params: { fields: "status", access_token: ACCESS_TOKEN },
//           timeout: 10000
//         }
//       );
//       status = statusCheck.data.status;
//       console.log(`Current status: ${status}`);
//     }

//     if (status !== "FINISHED") {
//       throw new Error(`Media processing failed: ${status}`);
//     }

//     // Step 3: Publish
//     const publishResponse = await axios.post(
//       `https://graph.facebook.com/v19.0/${Inst_ID}/media_publish`,
//       {
//         creation_id: creationId,
//         access_token: ACCESS_TOKEN,
//       },
//       { timeout: 30000 }
//     );

//     console.log("Story published:", publishResponse.data.id);
//     return { success: true, id: publishResponse.data.id };
//   } catch (error) {
//     console.error("Instagram story error:", error.response?.data || error.message);
//     return { success: false, error: error.response?.data || error.message };
//   }
// };

// // 6. Instagram Video Story
// const postToVideoStoryInstagram = async (Inst_ID, ACCESS_TOKEN, VIDEO_URL) => {
//   try {
//     console.log(`Starting Instagram video story for account ${Inst_ID}`);

//     // Step 1: Create media container
//     const mediaResponse = await axios.post(
//       `https://graph.facebook.com/v20.0/${Inst_ID}/media`,
//       {
//         video_url: VIDEO_URL,
//         media_type: "STORIES",
//         access_token: ACCESS_TOKEN,
//       },
//       { timeout: 30000 }
//     );

//     const creationId = mediaResponse.data.id;
//     console.log("Video container created:", creationId);

//     // Step 2: Poll for status (longer timeout for videos)
//     let status = "IN_PROGRESS";
//     while (status === "IN_PROGRESS") {
//       await new Promise(resolve => setTimeout(resolve, 5000));
//       const statusCheck = await axios.get(
//         `https://graph.facebook.com/v20.0/${creationId}`,
//         {
//           params: { fields: "status", access_token: ACCESS_TOKEN },
//           timeout: 10000
//         }
//       );
//       status = statusCheck.data.status;
//       console.log(`Current status: ${status}`);
//     }

//     if (status !== "FINISHED") {
//       throw new Error(`Video processing failed: ${status}`);
//     }

//     // Step 3: Publish
//     const publishResponse = await axios.post(
//       `https://graph.facebook.com/v20.0/${Inst_ID}/media_publish`,
//       {
//         creation_id: creationId,
//         access_token: ACCESS_TOKEN,
//       },
//       { timeout: 30000 }
//     );

//     console.log("Video story published:", publishResponse.data.id);
//     return { success: true, id: publishResponse.data.id };
//   } catch (error) {
//     console.error("Instagram video story error:", error.response?.data || error.message);
//     return { success: false, error: error.response?.data || error.message };
//   }
// };

// // 7. Instagram Feed Image
// const postToImageFeedInstagram = async (Inst_ID, ACCESS_TOKEN, PHOTO_URL, caption = "") => {
//   try {
//     console.log(`Posting image to Instagram feed for account ${Inst_ID}`);

//     // Step 1: Create media container
//     const mediaResponse = await axios.post(
//       `https://graph.facebook.com/v19.0/${Inst_ID}/media`,
//       {
//         image_url: PHOTO_URL,
//         caption: caption,
//         access_token: ACCESS_TOKEN,
//       },
//       { timeout: 30000 }
//     );

//     const creationId = mediaResponse.data.id;
//     console.log("Media container created:", creationId);

//     // Step 2: Poll for status
//     let status = "IN_PROGRESS";
//     while (status === "IN_PROGRESS") {
//       await new Promise(resolve => setTimeout(resolve, 2000));
//       const statusCheck = await axios.get(
//         `https://graph.facebook.com/v19.0/${creationId}`,
//         {
//           params: { fields: "status", access_token: ACCESS_TOKEN },
//           timeout: 10000
//         }
//       );
//       status = statusCheck.data.status;
//       console.log(`Current status: ${status}`);
//     }

//     if (status !== "FINISHED") {
//       throw new Error(`Media processing failed: ${status}`);
//     }

//     // Step 3: Publish
//     const publishResponse = await axios.post(
//       `https://graph.facebook.com/v19.0/${Inst_ID}/media_publish`,
//       {
//         creation_id: creationId,
//         access_token: ACCESS_TOKEN,
//       },
//       { timeout: 30000 }
//     );

//     console.log("Feed image published:", publishResponse.data.id);
//     return { success: true, id: publishResponse.data.id };
//   } catch (error) {
//     console.error("Instagram feed image error:", error.response?.data || error.message);
//     return { success: false, error: error.response?.data || error.message };
//   }
// };

// // 8. Instagram Reels
// const postReelToInstagram = async (Inst_ID, ACCESS_TOKEN, VIDEO_URL, caption = "") => {
//   try {
//     console.log(`Uploading Reel to Instagram account ${Inst_ID}`);

//     // Step 1: Create media container
//     const mediaResponse = await axios.post(
//       `https://graph.facebook.com/v20.0/${Inst_ID}/media`,
//       {
//         video_url: VIDEO_URL,
//         media_type: "REELS",
//         caption: caption,
//         access_token: ACCESS_TOKEN,
//       },
//       { timeout: 30000 }
//     );

//     const creationId = mediaResponse.data.id;
//     console.log("Reel container created:", creationId);

//     // Step 2: Poll for status (longer timeout for reels)
//     let status = "IN_PROGRESS";
//     while (status === "IN_PROGRESS") {
//       await new Promise(resolve => setTimeout(resolve, 5000));
//       const statusCheck = await axios.get(
//         `https://graph.facebook.com/v20.0/${creationId}`,
//         {
//           params: { fields: "status", access_token: ACCESS_TOKEN },
//           timeout: 10000
//         }
//       );
//       status = statusCheck.data.status;
//       console.log(`Current status: ${status}`);
//     }

//     if (status !== "FINISHED") {
//       throw new Error(`Reel processing failed: ${status}`);
//     }

//     // Step 3: Publish
//     const publishResponse = await axios.post(
//       `https://graph.facebook.com/v20.0/${Inst_ID}/media_publish`,
//       {
//         creation_id: creationId,
//         access_token: ACCESS_TOKEN,
//       },
//       { timeout: 30000 }
//     );

//     console.log("Reel published:", publishResponse.data.id);
//     return { success: true, id: publishResponse.data.id };
//   } catch (error) {
//     console.error("Instagram Reel error:", error.response?.data || error.message);
//     return { success: false, error: error.response?.data || error.message };
//   }
// };

// // Main scheduling function
// const schedulePosts = async () => {
//   try {
//     console.log("\n=== Running post scheduler ===");
//     const now = Date.now();
//     const posts = await Content.find({
//       unixtime: { $gte: Math.floor(now / 1000) } // Only future posts
//     }).sort({ unixtime: 1 });

//     console.log(`Found ${posts.length} scheduled posts`);

//     // Clear existing timeouts
//     activeTimeouts.forEach(timeout => clearTimeout(timeout));
//     activeTimeouts.clear();

//     for (const post of posts) {
//       const {
//         _id,
//         Fb_ID,
//         Inst_ID,
//         ACCESS_TOKEN,
//         PHOTO_URL,
//         unixtime,
//         message = "",
//         for: platforms
//       } = post;

//       const postTime = parseInt(unixtime) * 1000;
//       const delay = postTime - now;

//       if (delay > 0) {
//         console.log(`\nScheduling post ${_id} for ${new Date(postTime)}`);
//         console.log(`Platforms: ${platforms.join(", ")}`);
//         console.log(`Will execute in ${Math.round(delay / 1000)} seconds`);

//         const timeoutId = setTimeout(async () => {
//           try {
//             console.log(`\n=== Executing post ${_id} ===`);
            
//             // Facebook posts
//             if (platforms.includes("facebook-story-image")) {
//               await postToImageStoryFacebook(Fb_ID, ACCESS_TOKEN, PHOTO_URL);
//             }
//             if (platforms.includes("facebook-story-video")) {
//               await postVideoStoryToFacebook(Fb_ID, ACCESS_TOKEN, PHOTO_URL);
//             }
//             if (platforms.includes("facebook-Feed-image")) {
//               await postToImageFeedFacebook(Fb_ID, ACCESS_TOKEN, PHOTO_URL, message);
//             }
//             if (platforms.includes("facebook-Feed-video")) {
//               await postToFacebookReels(Fb_ID, ACCESS_TOKEN, PHOTO_URL, message);
//             }

//             // Instagram posts
//             if (platforms.includes("instagram-story-image")) {
//               await postToImageStoryInstagram(Inst_ID, ACCESS_TOKEN, PHOTO_URL);
//             }
//             if (platforms.includes("instagram-story-video")) {
//               await postToVideoStoryInstagram(Inst_ID, ACCESS_TOKEN, PHOTO_URL);
//             }
//             if (platforms.includes("instagram-Feed-image")) {
//               await postToImageFeedInstagram(Inst_ID, ACCESS_TOKEN, PHOTO_URL, message);
//             }
//             if (platforms.includes("instagram-Feed-video")) {
//               await postReelToInstagram(Inst_ID, ACCESS_TOKEN, PHOTO_URL, message);
//             }

//             console.log(`Completed post ${_id} at ${new Date()}`);
//           } catch (error) {
//             console.error(`Error executing post ${_id}:`, error);
//           } finally {
//             activeTimeouts.delete(_id.toString());
//           }
//         }, delay);

//         activeTimeouts.set(_id.toString(), timeoutId);
//       }
//     }

//     console.log("\n=== Scheduling complete ===");
//     console.log(`Active timeouts: ${activeTimeouts.size}`);
//   } catch (error) {
//     console.error("Scheduler error:", error);
//   }
// };

// // Export all functions for testing
// module.exports = {
//   schedulePosts,
//   postToImageStoryFacebook,
//   postVideoStoryToFacebook,
//   postToImageFeedFacebook,
//   postToFacebookReels,
//   postToImageStoryInstagram,
//   postToVideoStoryInstagram,
//   postToImageFeedInstagram,
//   postReelToInstagram,
//   // Expose for testing
//   _activeTimeouts: activeTimeouts
// };