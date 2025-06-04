const express = require("express");
const story = express.Router();
const Data = require("../../controller/Story/story");



story.route("/post-story").post(Data.postStory);
// story.route("/get-story").get(Data.getStory);


module.exports = story