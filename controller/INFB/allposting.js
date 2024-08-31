const axios = require('axios');
const Content = require("../../model/facebook/story")

// Function to post image story to Facebook
const postToImageStoryFacebook = async (Fb_ID, ACCESS_TOKEN, PHOTO_URL) => {
  try {
    console.log("stated")
    const uploadResponse = await axios.post(
      `https://graph.facebook.com/v19.0/${Fb_ID}/photos`,
      {
        url: PHOTO_URL,  
        published: false,
        access_token: ACCESS_TOKEN,    
      } 
    );

    console.log("First step done",uploadResponse);
    const photoId = uploadResponse.data.id;
    const data = await axios.post(
      `https://graph.facebook.com/v20.0/${Fb_ID}/photo_stories`,
      {
        photo_id: photoId,
        access_token: ACCESS_TOKEN,
      }
    );  

    console.log("Facebook story posted successfully!",data);
  } catch (error) {
    console.error(
      "Error posting story to Facebook:",
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
const postToImageFeedInstagram = async (Inst_ID, ACCESS_TOKEN, PHOTO_URL , message) => {
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

// Function to schedule the posts
const schedulePosts = async () => {
  console.log("stated")
  try {
    
    const posts = await Content.find();
  // console.log("posts",posts) 
 
    
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
            if (platforms.includes("facebook-story-image")) {
              console.log("FB story"); 
              postToImageStoryFacebook(Fb_ID, ACCESS_TOKEN, PHOTO_URL);
            }
            if (platforms.includes("facebook-Feed-image")) {
              console.log("FB post");
              postToImageFeedFacebook(Fb_ID, ACCESS_TOKEN, PHOTO_URL, message);
            }
            if (platforms.includes("instagram-story-image")) {
              console.log("Insta story"); 
              postToImageStoryInstagram(Inst_ID, ACCESS_TOKEN, PHOTO_URL);
            } 
            if (platforms.includes("instagram-Feed-image")) {
              console.log("Insta post");
              postToImageFeedInstagram(Inst_ID, ACCESS_TOKEN, PHOTO_URL,message);
            }
          }, delay);
        }
      }
    );
  } catch (error) {
    console.error('Error fetching posts from MongoDB:', error);
  }
};

// schedulePosts();
module.exports= {schedulePosts}



