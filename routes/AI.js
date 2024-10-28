
const Textai = require("../controller/AI/text"); 
const ImageAi = require("../controller/AI/image");
const express = require("express");
const AI = express.Router();
const multer = require("multer");

// Set up multer to handle image uploads in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

AI.route("/ask").post(Textai.TextGpt);

// Route for generating description
AI.route("/generate-description").post(upload.single("image"), ImageAi.generateDescription);

module.exports = AI;
