const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    videoUrl: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    CLIENT_ID: {
        type: String,
        required: true
    },
    CLIENT_SECRET: {
        type: String,
        required: true
    },
    REDIRECT_URI: {
        type: String,
        required: true
    },
    REFRESH_TOKEN: {
        type: String
    },
    ACCESS_TOKEN: {
        type: String
    },
    createAt: {
        type: Date,
        default: Date.now
    },
    unixtime: {
        type: String,
        required: true
    },
   
    youtubeVideoId: {
        type: String
    },
      account: {
        type: String,
        required: true,
        default: 'account1'
    },
});

module.exports = mongoose.model('YtPost', postSchema);