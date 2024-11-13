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
          PHOTO_URL: PHOTO_URL,
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
const schedulePosts = async () => {
  console.log("stated");
  try {
    const posts = await Content.find();
    posts.forEach(
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
            // Facebook
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
  } catch (error) {
    console.error("Error fetching posts from MongoDB:", error);
  }
};

// schedulePosts();
module.exports = { schedulePosts };
