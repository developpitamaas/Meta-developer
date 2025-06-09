// const Story = require("../../model/facebook/story");
// const { schedulePosts } = require("../INFB/allposting");

// const postStory = async (req,res) => {
//     try {
//         const response = await Story.create(req.body);
// schedulePosts()

//         res.status(201).json(response);
//     } catch (error) {
//         res.status(500).json({message: error.message});
//     }
// }

// const getStory = async (req, res) => {
//   try {
//     const currentTime = Math.floor(Date.now() / 1000);
    
//     const filter = req.query.filter;
    
//     let stories = await Story.find();
    

//     stories = stories.map(story => {
//       const isoTime = new Date(story.unixtime * 1000).toISOString();
//       return {
//         ...story._doc,
//         isoTime: isoTime,
//         isUpcoming: parseInt(story.unixtime) > currentTime
//       };
//     });
    
//     if (filter === 'upcoming') {
//       stories = stories.filter(story => story.isUpcoming);
//     } else if (filter === 'past') {
//       stories = stories.filter(story => !story.isUpcoming);
//     }
    
//     res.status(200).json(stories);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// module.exports = { postStory , getStory  };


const Story = require("../../model/facebook/story");
const { schedulePosts } = require("../INFB/allposting");

const postStory = async (req, res) => {
    try {
        // Validate required fields
        if (!req.body.unixtime || !req.body.for || !req.body.PHOTO_URL) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Create the story
        const response = await Story.create(req.body);
        
        // Log the creation
        console.log(`Created new post scheduled for ${new Date(parseInt(response.unixtime) * 1000)}`);
        
        // Trigger the scheduler
        schedulePosts();

        res.status(201).json({
            ...response._doc,
            isoTime: new Date(parseInt(response.unixtime) * 1000).toISOString(),
            isUpcoming: parseInt(response.unixtime) > Math.floor(Date.now() / 1000)
        });
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ message: error.message });
    }
}

const getStory = async (req, res) => {
  try {
    const currentTime = Math.floor(Date.now() / 1000);
    const filter = req.query.filter;
    
    let stories = await Story.find().sort({ unixtime: 1 }); // Sort by unixtime
    
    // Enhance stories with additional fields
    stories = stories.map(story => ({
      ...story._doc,
      isoTime: new Date(parseInt(story.unixtime) * 1000).toISOString(),
      isUpcoming: parseInt(story.unixtime) > currentTime
    }));
    
    // Apply filtering if requested
    if (filter === 'upcoming') {
      stories = stories.filter(story => story.isUpcoming);
    } else if (filter === 'past') {
      stories = stories.filter(story => !story.isUpcoming);
    }
    
    res.status(200).json(stories);
  } catch (error) {
    console.error("Error fetching stories:", error);
    res.status(500).json({ message: error.message });
  }
};

const  deleteStory = async (req, res) => {
  try {
    const deletedStory = await Story.findByIdAndDelete(req.params.id);
    if (!deletedStory) {
      return res.status(404).json({ message: "Story not found" });
    }
    res.status(200).json({ message: "Story deleted successfully" });
  } catch (error) {
    console.error("Error deleting story:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { postStory, getStory , deleteStory };