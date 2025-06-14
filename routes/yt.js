const express = require('express');
const router = express.Router();
const {
  getAuthUrl,
  handleCallback,
  uploadVideo
} = require('../controller/YT/uploadcontroller');

// Authentication routes
router.get('/auth/:accountId', getAuthUrl);
router.get('/callback/:accountId', handleCallback);

// Upload route
router.post('/upload/:accountId', uploadVideo);

module.exports = router;