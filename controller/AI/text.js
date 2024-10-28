
const axios = require('axios');
const TextGpt = async (req, res) => {
    const { question } = req.body;
  
    try {
      // Updated payload structure
      const requestBody = {
        contents: [
          {
            parts: [
              { text: question }
            ]
          }
        ]
      };
  
      // Make a POST request to Gemini API
      const response = await axios.post(process.env.GEMINI_ENDPOINT, requestBody, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
  
      // Extract the AI-generated response
      const aiResponse = response.data.candidates[0].content;
      res.json({ answer: aiResponse });
    } catch (error) {
      console.error('Error generating response:', error);
      res.status(500).json({ error: 'Failed to get response from AI' });
    }
  };


  module.exports = {TextGpt}