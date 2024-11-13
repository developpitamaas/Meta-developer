// // const data = [
// //     {
// //       message: "Hello World! 11:13:27  sec ",
// //       time: 1713332607,
// //     },
// //     {
// //       message: "Hello World! 2 11:13:40 ",
// //       time: 1713332620,
// //     },
// //     {
// //       message: "Hello World! 3 11:14:12 ",
// //       time: 1713332652,
// //     },
// //   ];

// //   function scheduleMessages() {
// //     data.forEach(({ message, time }) => {
// //       const delay = time * 1000 - Date.now();
// //       if (delay > 0) {
// //         setTimeout(() => {
// //           console.log(message);
// //         }, delay);
// //       }
// //     });
// //   }

// //   scheduleMessages();



// const axios = require("axios");

// // Your data array
// const data = [
//   {
//     Inst_ID: "17841401994416697",
//     ACCESS_TOKEN:
//       "EAAHHE4tDdh0BO0Ei8lzP4Cy45nZAInDwKfZBhHdlbWLGDmY1A8Pec3hXH5fTCjDHyISBHM7eKcbk7JJMx5gUgHx78Og5ML0JpYwwtRAvWt8meZAd00sImxdTfZBxzPKsyTqyxWcoIeiHWZAZCfQVwqtxAx1nkZAMOVJMg9STg21ZB1zgpw5bup8ZA1vMjtzO8Yv8ZD",
//     PHOTO_URL: "https://www.pitamaas.com/logo-dark-mobile.png",
//     unixtime: "1725002850",
//     for: ["instagram-story-image"],
//   },
//   {
//     Fb_ID: "145729388946006",
//     Inst_ID: "17841401994416697",
//     ACCESS_TOKEN:
//       "EAAHHE4tDdh0BO0Ei8lzP4Cy45nZAInDwKfZBhHdlbWLGDmY1A8Pec3hXH5fTCjDHyISBHM7eKcbk7JJMx5gUgHx78Og5ML0JpYwwtRAvWt8meZAd00sImxdTfZBxzPKsyTqyxWcoIeiHWZAZCfQVwqtxAx1nkZAMOVJMg9STg21ZB1zgpw5bup8ZA1vMjtzO8Yv8ZD",
//     PHOTO_URL: "https://www.pitamaas.com/logo-dark-mobile.png",
//     unixtime: "1725002850",
//     for: ["facebook-story-image"],
//   },

//   {
//     Inst_ID: "17841401994416697",
//     ACCESS_TOKEN:
//       "EAAHHE4tDdh0BO0Ei8lzP4Cy45nZAInDwKfZBhHdlbWLGDmY1A8Pec3hXH5fTCjDHyISBHM7eKcbk7JJMx5gUgHx78Og5ML0JpYwwtRAvWt8meZAd00sImxdTfZBxzPKsyTqyxWcoIeiHWZAZCfQVwqtxAx1nkZAMOVJMg9STg21ZB1zgpw5bup8ZA1vMjtzO8Yv8ZD",
//     PHOTO_URL: "https://www.pitamaas.com/logo-dark-mobile.png",
//     unixtime: "1725002850",
//     message: "Pitamas",
//     for: ["instagram-Feed-image"],
//   },
//   {
//     Fb_ID: "145729388946006",
//     ACCESS_TOKEN:
//       "EAAHHE4tDdh0BO0Ei8lzP4Cy45nZAInDwKfZBhHdlbWLGDmY1A8Pec3hXH5fTCjDHyISBHM7eKcbk7JJMx5gUgHx78Og5ML0JpYwwtRAvWt8meZAd00sImxdTfZBxzPKsyTqyxWcoIeiHWZAZCfQVwqtxAx1nkZAMOVJMg9STg21ZB1zgpw5bup8ZA1vMjtzO8Yv8ZD",
//     PHOTO_URL: "https://www.pitamaas.com/logo-dark-mobile.png",
//     unixtime: "1725002850",
//     message: "Pitamas",
//     for: ["facebook-Feed-image"],
//   },
// ];

// // Function to post image story to Facebook
// const postToImageStoryFacebook = async (Fb_ID, ACCESS_TOKEN, PHOTO_URL) => {
//   try {
//     const uploadResponse = await axios.post(
//       `https://graph.facebook.com/v19.0/${Fb_ID}/photos`,
//       {
//         url: PHOTO_URL,
//         published: false,
//         access_token: ACCESS_TOKEN,
//       }
//     );

//     console.log("fistst satep done");
//     const photoId = uploadResponse.data.id;
//     await axios.post(
//       `https://graph.facebook.com/v20.0/${Fb_ID}/photo_stories`,
//       {
//         photo_id: photoId,
//         access_token: ACCESS_TOKEN,
//       }
//     );

//     console.log("Facebook story posted successfully!");
//   } catch (error) {
//     console.error(
//       "Error posting story to Facebook:",
//       error.response ? error.response.data : error.message
//     );
//   }
// };

// // Function to post image story to Instagram
// const postToImageStoryInstagram = async (Inst_ID, ACCESS_TOKEN, PHOTO_URL) => {
//   try {
//     const mediaUrl = `https://graph.facebook.com/v19.0/${Inst_ID}/media`;

//     // Post the image to Instagram
//     const mediaResponse = await axios.post(mediaUrl, null, {
//       params: {
//         media_type: "STORIES",
//         caption: "Instagram Story",
//         image_url: PHOTO_URL,
//         access_token: ACCESS_TOKEN,
//       },
//     });

//     const creationId = mediaResponse.data.id;
//     console.log(` step -1 Instagram creation : ${creationId}`);

//     const mediaUrlforPost = `https://graph.facebook.com/v19.0/${Inst_ID}/media_publish`;
//     // Post the story to Instagram
//     const storyResponse = await axios.post(mediaUrlforPost, null, {
//       params: {
//         creation_id: `${creationId}`,
//         access_token: ACCESS_TOKEN,
//       },
//     });

//     const instaResponseId = storyResponse.data.id;
//     console.log(`2 step -Instagram story response ID: ${instaResponseId}`);
//   } catch (error) {
//     console.error(
//       "Error posting story to Instagram:",
//       error.response ? error.response.data : error.message
//     );
//   }
// };

// // Function to post image on feed to Facebook
// const postToImageFeedFacebook = async (
//   Fb_ID,
//   ACCESS_TOKEN,
//   PHOTO_URL,
//   message
// ) => {
//   console.log("post image on feed");
//   try {
//     const response = await axios.post(
//       `https://graph.facebook.com/v19.0/${Fb_ID}/photos`,
//       {
//         url: PHOTO_URL,
//         access_token: ACCESS_TOKEN,
//         message: message,
//       }
//     );
//     console.log("fistst satep done");
//   } catch (error) {
//     console.error(
//       "Error posting story to Facebook:",
//       error.response ? error.response.data : error.message
//     );
//   }
// };

// // Function to post image story to Instagram
// const postToImageFeedInstagram = async (Inst_ID, ACCESS_TOKEN, PHOTO_URL) => {
//   console.log("insta post");
//   try {
//     const mediaUrl = `https://graph.facebook.com/v19.0/${Inst_ID}/media`;

//     // Post the image to Instagram
//     const mediaResponse = await axios.post(mediaUrl, null, {
//       params: {
//         image_url: PHOTO_URL,
//         access_token: ACCESS_TOKEN,
//       },
//     });

//     const creationId = mediaResponse.data.id;
//     console.log(` step -1 Instagram creation : ${creationId}`);

//     const mediaUrlforPost = `https://graph.facebook.com/v19.0/${Inst_ID}/media_publish`;
//     // Post the story to Instagram
//     const storyResponse = await axios.post(mediaUrlforPost, null, {
//       params: {
//         creation_id: `${creationId}`,
//         access_token: ACCESS_TOKEN,
//       },
//     });

//     const instaResponseId = storyResponse.data.id;
//     console.log(`2 step -Instagram story response ID: ${instaResponseId}`);
//   } catch (error) {
//     console.error(
//       "Error posting story to Instagram:",
//       error.response ? error.response.data : error.message
//     );
//   }
// };

// // Function to schedule the posts
// function schedulePosts() {
//   data.forEach(
//     ({
//       Fb_ID,
//       message,
//       Inst_ID,
//       ACCESS_TOKEN,
//       PHOTO_URL,
//       unixtime,
//       for: platforms,
//     }) => {
//       const delay = unixtime * 1000 - Date.now();
//       if (delay > 0) {
//         setTimeout(() => {
//           if (platforms.includes("facebook-story-image")) {
//             console.log("fb story");
//             postToImageStoryFacebook(Fb_ID, ACCESS_TOKEN, PHOTO_URL);
//           }
//           if (platforms.includes("facebook-Feed-image")) {
//             console.log("fb post");

//             postToImageFeedFacebook(Fb_ID, ACCESS_TOKEN, PHOTO_URL, message);
//           }
//           if (platforms.includes("instagram-story-image")) {
//             console.log("insta story");

//             postToImageStoryInstagram(Inst_ID, ACCESS_TOKEN, PHOTO_URL);
//           }
//           if (platforms.includes("instagram-Feed-image")) {
//             console.log("insta post");

//             postToImageFeedInstagram(Inst_ID, ACCESS_TOKEN, PHOTO_URL);
//           }
//         }, delay);
//       }
//     }
//   );
// }

// schedulePosts();


const axios = require("axios");

const postToVideoPostFacebook = async (Fb_ID, ACCESS_TOKEN, VIDEO_URL) => {
    try {
      console.log("Starting video upload process");
  
      // Step 1: Start the upload session
      const startResponse = await axios.post(
        `https://graph.facebook.com/v20.0/${Fb_ID}/videos`,
        {
          upload_phase: 'start',
          access_token: ACCESS_TOKEN,
        }
      );
  
      console.log("Upload session started:", startResponse.data);
      const uploadSessionId = startResponse.data.upload_session_id;
  
      // Step 2: Transfer the video file
      const transferResponse = await axios.post(
        `https://graph.facebook.com/v20.0/${Fb_ID}/videos`,
        {
        //   upload_phase: 'transfer',
          start_offset: '0', // This should be adjusted if using chunks
          upload_session_id: uploadSessionId,
          file_url: VIDEO_URL, // URL of the video file to be uploaded
          access_token: ACCESS_TOKEN,
        }
      );
  
      console.log("Video file transferred:", transferResponse.data);
  
      // Step 3: Finish the upload
      const finishResponse = await axios.post(
        `https://graph.facebook.com/v20.0/${Fb_ID}/videos`,
        {
          upload_phase: 'finish',
          upload_session_id: uploadSessionId,
          access_token: ACCESS_TOKEN,
        }
      );
  
      console.log("Video upload finished:", finishResponse.data);
  
      // Step 4: Post the video as a story using the video ID
      const data = await axios.post(
        `https://graph.facebook.com/v20.0/${Fb_ID}/video_stories`,
        {
          video_id: finishResponse.data.video_id,
          access_token: ACCESS_TOKEN,
        }
      );
  
      console.log("Facebook video story posted successfully!", data);
    } catch (error) {
      console.error(
        "Error posting video story to Facebook:",
        error.response ? error.response.data : error.message
      );
    }
  };
  
  
  const postVideoToReel = async (Fb_ID, ACCESS_TOKEN, VIDEO_URL) => {
    try {
      console.log("Starting video upload process to Facebook Reels");
  
      // Step 1: Start the upload session
      const startResponse = await axios.post(
        `https://graph.facebook.com/v20.0/${Fb_ID}/video_reels`,
        {
          upload_phase: 'start',
          access_token: ACCESS_TOKEN,
        }
      );
  
      const uploadSessionId = startResponse.data.upload_session_id;
      if (!uploadSessionId) {
        throw new Error("Failed to obtain upload session ID");
      }
      console.log("Upload session started with ID:", uploadSessionId);
  
      // Step 2: Transfer the video file
      const transferResponse = await axios.post(
        `https://graph.facebook.com/v20.0/${Fb_ID}/video_reels`,
        {
        //   upload_phase: 'transfer',
          start_offset: '0',
          upload_session_id: uploadSessionId,
          file_url: VIDEO_URL,
          access_token: ACCESS_TOKEN,
        }
      );
  
      console.log("Video file transferred:", transferResponse.data);
  
      // Step 3: Finish the upload
      const finishResponse = await axios.post(
        `https://graph.facebook.com/v20.0/${Fb_ID}/video_reels`,
        {
          upload_phase: 'finish',
          upload_session_id: uploadSessionId,
          access_token: ACCESS_TOKEN,
        }
      );
  
      const videoId = finishResponse.data.video_id;
      if (!videoId) {
        throw new Error("Failed to finalize video upload");
      }
      console.log("Video upload finished with ID:", videoId);
  
      // Step 4: Post the video as a story
      const data = await axios.post(
        `https://graph.facebook.com/v20.0/${Fb_ID}/video_reels`,
        {
          video_id: videoId,
          access_token: ACCESS_TOKEN,
        }
      );
  
      console.log("Facebook Reel posted successfully!", data.data);
    } catch (error) {
      console.error("Error uploading video as reel to Facebook:", error.response ? error.response.data : error.message);
    }
  };
  
  
  

// Calling function
const Fb_ID = "145729388946006";  // Facebook page or user ID
const ACCESS_TOKEN = "EAAHHE4tDdh0BO1fXd4v5wPGQpI9aSb5wjMC1HluDUc01WyTrW3uZCNg7E5lgQkAD0DfEFM5yKKZA004fu7MPxtH1BxW0DsU1duZAfa3INfJZC1kgY4VVZBRl14cuh8TQZCC8TVy1rs92ISQjaJULxYKETjCGX6vc4Xsb6C0w99ssgoxJZA9Q7CO5rJnfRaPIioZD";  // Your access token
// const VIDEO_URL = "https://res.cloudinary.com/dunzldpvc/video/upload/v1731389494/1_second_short_epedm4.mp4";  // Video URL
const VIDEO_URL = "https://res.cloudinary.com/dunzldpvc/video/upload/v1731305384/Vmake-1710752842792_2_1_rmkjif.mp4";  // Video URL

// postToVideoPostFacebook(Fb_ID, ACCESS_TOKEN, VIDEO_URL);
postVideoToReel(Fb_ID, ACCESS_TOKEN, VIDEO_URL);

