const mongoose = require("mongoose")
const UserScheme = mongoose.Schema ({
    username: {
        type: String,
        maxLenght: 50,
        required: true
    },
    firstname: {
        type: String,
        maxlenght: 50,
        required: true
    },
    lastname: {
        type: String,
        maxlenght: 50,
        required: true
    },
    publicName: {
        type: Boolean,
        required: false
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
    password: {
        type: String,
        minlenght: 8,
        maxlenght: 100
    },
    refreshJWT: {
            token:{
                type: String,
                maxLenght:500,
                default: ''
            },
            addedAt: {
                type: Date,
                required: true,
                default: Date.now()
            },
        },
    isVerified: {
        type: Boolean,
        required: true,
        default: true
    },
    signInOrigin: {
        type: String,
        maxLenght: 20,
        default:"form"
    },
    isCompleted: {
        type: Number,
        required: false,
        default: 0
    },
    randomURL: {
        type: String,
        maxLenght: 100,
        default:""
    },
    emails: [],
    address: [],
    phones: [],
    social: [],
    lastLogin:{
        type: Date,
        default: Date.now
    },
    isLogged:{
        type: Boolean,
        default:false
    }

});
 
module.exports ={
   UserScheme
}