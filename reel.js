const axios = require("axios");

const postToVideoStoryFacebook = async (Fb_ID, ACCESS_TOKEN, VIDEO_URL) => {
  try {
    console.log("Starting video upload process to Facebook Reels");

    // Step 1: Start the upload session (ensure you're passing correct parameters)
    const sessionInitResponse = await axios.post(
      `https://graph-video.facebook.com/v19.0/${Fb_ID}/videos`,
      {
        upload_phase: "start",
        file_size: 0,  // No need to know the file size for URL uploads
        file_url: VIDEO_URL,  
        access_token: ACCESS_TOKEN,
      }
    );
    console.log(sessionInitResponse)

    // Check for the presence of upload_session_id
    if (!sessionInitResponse.data.upload_session_id) {
      console.error("Failed to obtain upload session ID");
      return;
    }

    const uploadSessionId = sessionInitResponse.data.upload_session_id;
    console.log("Upload session started with ID:", uploadSessionId);

    // Step 2: Finish the upload (no chunks for URL upload)
    const finishResponse = await axios.post(
      `https://graph-video.facebook.com/v19.0/${Fb_ID}/videos`,
      {
        upload_phase: "finish",
        upload_session_id: uploadSessionId,
        access_token: ACCESS_TOKEN,
      }
    );

    console.log("Video uploaded successfully:", finishResponse.data);

    // Step 3: Post the uploaded video as a story
    const data = await axios.post(
      `https://graph.facebook.com/v20.0/${Fb_ID}/video_stories`,  // Use /reels if it's a reel
      {
        video_id: finishResponse.data.id,  // Use the video ID returned from finish phase
        access_token: ACCESS_TOKEN,
      }
    );

    console.log("Video story posted successfully!", data.data);
  } catch (error) {
    console.error("Error uploading video as reel to Facebook:", error.response ? error.response.data : error.message);
  }
};
  
  
// Example usage
// Calling function
const Fb_ID = "145729388946006";  // Facebook page or user ID
const ACCESS_TOKEN = "EAAHHE4tDdh0BO1fXd4v5wPGQpI9aSb5wjMC1HluDUc01WyTrW3uZCNg7E5lgQkAD0DfEFM5yKKZA004fu7MPxtH1BxW0DsU1duZAfa3INfJZC1kgY4VVZBRl14cuh8TQZCC8TVy1rs92ISQjaJULxYKETjCGX6vc4Xsb6C0w99ssgoxJZA9Q7CO5rJnfRaPIioZD";  // Your access token
const VIDEO_URL = "https://res.cloudinary.com/dunzldpvc/video/upload/v1731392842/Snapsave.app_06439FE1FDA91B55C763EC4E9CA234B4_video_dashinit_p7axlb.mp4";  // Video URL

// postToVideoStoryFacebook(Fb_ID, ACCESS_TOKEN, VIDEO_URL);
postToVideoStoryFacebook(Fb_ID, ACCESS_TOKEN, VIDEO_URL);
