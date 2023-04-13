const mongoose = require("mongoose");
const ConversationScheme = mongoose.Schema ({
    time: {
        type: Date,
        default: Date.now
    },
    members:[{
        userId:{
            type: String,
            maxLenght: 30,
        }, 
        username: {
            type: String,
            maxLenght: 50
        },
        picture: {
            fileName: {
                type: String,
                required: false,
            },
            file: {
                data: Buffer,
                contentType: String,
            },
            uploadTime: {
                type: Date,
                default: Date.now,
            },
            type: {
                type: String,
                maxLenght: 20
            }
        },
        }
    ],
    messages: [{
        senderId: {
            type: String,
            maxLenght: 30,
        },
        message: {
            type: String,
            maxLenght: 400
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        readed: {
            type: Boolean,
            default: false
        }
    }],
    archived : {
        type: Boolean,
        default: false
    }
});
 
module.exports ={
   ConversationScheme
}