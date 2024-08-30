


const Story = require('../../model/facebook/story');
const {schedulePosts} = require("../INFB/allposting")

const postStory = async (req,res) => {
    try {
        const response = await Story.create(req.body);
schedulePosts()

        res.status(201).json(response);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

module.exports = {postStory}