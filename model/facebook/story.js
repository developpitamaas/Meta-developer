const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
    Inst_ID :{
        type : String
    },
    Fb_ID :{
        type : String
    },
    ACCESS_TOKEN :{
        type : String
    },
    PHOTO_URL :{
        type : String
    },
    unixtime :{
        type : String
    },
    message:{
        type : String
    },
    for :{
        type: [String],
    },
});

module.exports = mongoose.model('Storydata', storySchema);
