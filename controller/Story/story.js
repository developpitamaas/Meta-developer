const Story = require("../../model/facebook/story");
const { schedulePosts } = require("../INFB/allposting");

const postStory = async (req, res) => {
  try {
    const response = await Story.create(req.body);
    schedulePosts();
    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStory = async (req, res) => {
  try {
    const currentTime = Math.floor(Date.now() / 1000);
    
    const filter = req.query.filter;
    
    let stories = await Story.find();
    
    
    stories = stories.map(story => {
      const isoTime = new Date(story.unixtime * 1000).toISOString();
      return {
        ...story._doc,
        isoTime: isoTime,
        isUpcoming: parseInt(story.unixtime) > currentTime
      };
    });
    
    if (filter === 'upcoming') {
      stories = stories.filter(story => story.isUpcoming);
    } else if (filter === 'past') {
      stories = stories.filter(story => !story.isUpcoming);
    }
    
    res.status(200).json(stories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { postStory , getStory };
