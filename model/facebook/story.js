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
    realDate :{
        type : String
    },
    for :{
        type: [String],
    },
    createAt:{
        type : Date,
        default : Date.now
    }
});

module.exports = mongoose.model('Storydata', storySchema);
