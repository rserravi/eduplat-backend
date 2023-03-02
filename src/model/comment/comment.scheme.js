const mongoose = require("mongoose")
const CommentScheme = mongoose.Schema ({
    senderId: {
        type: String,
        maxLenght: 50,
        required: true
    },
    receiverId: {
        type: String,
        maxLenght: 50,
        required: true
    },
    commentText: {
        type: String,
        maxLenght: 500,
        required: true
    },
    valoration: {
        type: Number,
        required: false
    },
    date: {
        type: Date
    }
    

});
 
module.exports ={
   CommentScheme
}