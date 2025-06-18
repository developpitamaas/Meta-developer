const express = require("express");
const YT = express.Router();
const ytController = require("../controller/YT/createpost");

YT.route("/post").post(ytController.postYouTubeVideo);

module.exports = YT;  