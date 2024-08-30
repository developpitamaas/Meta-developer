const express = require("express");
const story = express.Router();
const Data = require("../../controller/Story/story");



story.route("/post-story").post(Data.postStory);


module.exports = story