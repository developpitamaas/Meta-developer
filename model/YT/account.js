const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    accountname: {
        type: String,
        required: true
    },
    CLIENT_ID:{
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
    refreshToken: {
        type: String
    },
    accessToken: {
        type: String
    },
    tokenExpiry: {
        type: Date
    }
});

module.exports = mongoose.model('ytaccount', postSchema);