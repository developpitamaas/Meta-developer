
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyC173q3386aM6I6clEXS2ED_F4eEtgcPQw");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

let lastImageBuffer = null; 

const generateDescription = async (req, res) => {

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  lastImageBuffer = req.file.buffer; 

  try {
    const prompt = req.body.prompt;  

    // Convert the image buffer to base64
    const image = {
      inlineData: {
        data: lastImageBuffer.toString("base64"),
        mimeType: req.file.mimetype, 
      },
    };

    // Generate content using the image and prompt
    const result = await model.generateContent([prompt, image]);

    // Return the generated description
    res.json({ description: result.response.text() });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while processing the image" });
  }
};

module.exports = { generateDescription };
