// const axios = require('axios');

// // Dummy data for demonstration
// const buttons = [
//     {
//         rowIndex: 1,
//         url: 'https://example.com/image1.jpg',
//         message: 'Sample message 1',
//         page_id: 'page_id_1',
//         creatio_id: 'creation_id_1',
//         fb_id: '',
//         Instapage_id: 'insta_page_id_1',
//         access_token: 'access_token_1',
//         time: '12:00',
//         year: 2024,
//         month: 8,
//         day: 29
//     },
//     {
//         rowIndex: 2,
//         url: 'https://example.com/image2.jpg',
//         message: 'Sample message 2',
//         page_id: 'page_id_2',
//         creatio_id: 'creation_id_2',
//         fb_id: '',
//         Instapage_id: 'insta_page_id_2',
//         access_token: 'access_token_2',
//         time: '14:30',
//         year: 2024,
//         month: 8,
//         day: 30
//     }
// ];

// let currentIndex = 0;

// async function processButtons(req, res) {
//     try {
//         await processButton();
//         res.send('All buttons processed.');
//     } catch (error) {
//         res.status(500).send(`Error: ${error.message}`);
//     }
// }

// async function processButton() {
//     if (currentIndex < buttons.length) {
//         const button = buttons[currentIndex];
//         await getSelectedRow(button);
//         currentIndex++;
//         setTimeout(processButton, 1000); // Delay for next button
//     }
// }

// async function getSelectedRow(button) {
//     const { url, message, page_id, creatio_id, fb_id, Instapage_id, access_token, time, year, month, day } = button;

//     const timeParts = time.split(":");
//     const hour = parseInt(timeParts[0], 10);
//     const minute = parseInt(timeParts[1], 10);
//     const second = 0;
//     const date = new Date(year, month - 1, day, hour, minute, second);
//     const unixTimestamp = date.getTime() / 1000;

//     try {
//         if (page_id) {
//             const fbResponse = await axios.post(`https://graph.facebook.com/v19.0/${page_id}/photos`, null, {
//                 params: {
//                     message,
//                     url,
//                     scheduled_publish_time: unixTimestamp,
//                     published: false,
//                     access_token
//                 }
//             });
//             const fbResponseId = fbResponse.data.id;
//             console.log(`Facebook response ID: ${fbResponseId}`);
//         }

//         if (Instapage_id) {
//             const mediaUrl = `https://graph.facebook.com/v19.0/${Instapage_id}/media`;

//             // Post the image to Instagram
//             const mediaResponse = await axios.post(mediaUrl, null, {
//                 params: {
//                     caption: message,
//                     image_url: url,
//                     access_token
//                 }
//             });
//             const creationId = mediaResponse.data.id;
//             console.log(`Instagram creation ID: ${creationId}`);

//             // Post the story to Instagram
//             const storyResponse = await axios.post(mediaUrl, null, {
//                 params: {
//                     media_type: 'STORIES',
//                     image_url: url,
//                     access_token
//                 }
//             });
//             const instaResponseId = storyResponse.data.id;
//             console.log(`Instagram story response ID: ${instaResponseId}`);

//             // Save to database or perform any final operation
//             await axios.post('http://yourserver.com/postonsocialmedia.aspx/SaveToDatabase', {
//                 fbpage_id: page_id,
//                 page_id: Instapage_id,
//                 time: unixTimestamp,
//                 token: access_token,
//                 creation: creationId,
//                 url,
//                 fbid: fbResponseId || '',
//                 instaid: instaResponseId || ''
//             });
//         }
//     } catch (error) {
//         console.error('Error:', error.message);
//         throw error;
//     }
// }

// module.exports = { processButtons };


const axios = require("axios");

// Your data array
const data = [
  {
    PAGE_ID: "145729388946006",
    ACCESS_TOKEN:
      "EAAHHE4tDdh0BO0Ei8lzP4Cy45nZAInDwKfZBhHdlbWLGDmY1A8Pec3hXH5fTCjDHyISBHM7eKcbk7JJMx5gUgHx78Og5ML0JpYwwtRAvWt8meZAd00sImxdTfZBxzPKsyTqyxWcoIeiHWZAZCfQVwqtxAx1nkZAMOVJMg9STg21ZB1zgpw5bup8ZA1vMjtzO8Yv8ZD",
    PHOTO_URL:
      "https://res.cloudinary.com/dtakusspm/image/upload/v1724484115/uffc8a6nzd13s0zfiik9.png",
    unixtime: "1724992050",
    for: ["instagram"]
  },
  {
    PAGE_ID: "145729388946006",
    ACCESS_TOKEN:
      "EAAHHE4tDdh0BO0Ei8lzP4Cy45nZAInDwKfZBhHdlbWLGDmY1A8Pec3hXH5fTCjDHyISBHM7eKcbk7JJMx5gUgHx78Og5ML0JpYwwtRAvWt8meZAd00sImxdTfZBxzPKsyTqyxWcoIeiHWZAZCfQVwqtxAx1nkZAMOVJMg9STg21ZB1zgpw5bup8ZA1vMjtzO8Yv8ZD",
    PHOTO_URL:
      "https://res.cloudinary.com/dtakusspm/image/upload/v1724484115/uffc8a6nzd13s0zfiik9.png",
    unixtime: "1724992110",
    for: ["instagram", "facebook"]
  },
  {
    PAGE_ID: "145729388946006",
    ACCESS_TOKEN:
      "EAAHHE4tDdh0BO0Ei8lzP4Cy45nZAInDwKfZBhHdlbWLGDmY1A8Pec3hXH5fTCjDHyISBHM7eKcbk7JJMx5gUgHx78Og5ML0JpYwwtRAvWt8meZAd00sImxdTfZBxzPKsyTqyxWcoIeiHWZAZCfQVwqtxAx1nkZAMOVJMg9STg21ZB1zgpw5bup8ZA1vMjtzO8Yv8ZD",
    PHOTO_URL:
      "https://res.cloudinary.com/dtakusspm/image/upload/v1724484115/uffc8a6nzd13s0zfiik9.png",
    unixtime: "1724992170",
    for: ["facebook"]
  },
];

// Function to post to Facebook
const postToFacebook = async (PAGE_ID, ACCESS_TOKEN, PHOTO_URL) => {
  try {
    // const uploadResponse = await axios.post(
    //   `https://graph.facebook.com/v19.0/${PAGE_ID}/photos`,
    //   {
    //     url: PHOTO_URL,
    //     published: false,
    //     access_token: ACCESS_TOKEN,
    //   }
    // );

    // const photoId = uploadResponse.data.id;
    // await axios.post(
    //   `https://graph.facebook.com/v20.0/${PAGE_ID}/photo_stories`,
    //   {
    //     photo_id: photoId,
    //     access_token: ACCESS_TOKEN,
    //   }
    // );

    console.log("Facebook story posted successfully!");
  } catch (error) {
    console.error(
      "Error posting story to Facebook:",
      error.response ? error.response.data : error.message
    );
  }
};

// Function to post to Instagram
const postToInstagram = async (PAGE_ID, ACCESS_TOKEN, PHOTO_URL) => {
  try {
    // const mediaUrl = `https://graph.facebook.com/v19.0/${PAGE_ID}/media`;

    // // Post the image to Instagram
    // const mediaResponse = await axios.post(mediaUrl, null, {
    //   params: {
    //     caption: "Instagram Story",
    //     image_url: PHOTO_URL,
    //     access_token: ACCESS_TOKEN,
    //   },
    // });

    // const creationId = mediaResponse.data.id;
    // console.log(`Instagram creation ID: ${creationId}`);

    // // Post the story to Instagram
    // const storyResponse = await axios.post(mediaUrl, null, {
    //   params: {
    //     media_type: 'STORIES',
    //     image_url: PHOTO_URL,
    //     access_token: ACCESS_TOKEN,
    //   },
    // });

    // const instaResponseId = storyResponse.data.id;
    console.log(`Instagram story response ID: ${instaResponseId}`);
  } catch (error) {
    console.error(
      "Error posting story to Instagram:",
      error.response ? error.response.data : error.message
    );
  }
};

// Function to schedule the posts
function schedulePosts() {
  data.forEach(({ PAGE_ID, ACCESS_TOKEN, PHOTO_URL, unixtime, for: platforms }) => {
    const delay = unixtime * 1000 - Date.now();
    if (delay > 0) {
      setTimeout(() => {
        if (platforms.includes("facebook")) {
          postToFacebook(PAGE_ID, ACCESS_TOKEN, PHOTO_URL);
        }
        if (platforms.includes("instagram")) {
          postToInstagram(PAGE_ID, ACCESS_TOKEN, PHOTO_URL);
        }
      }, delay);
    }
  });
}

// Start scheduling the posts
schedulePosts();
