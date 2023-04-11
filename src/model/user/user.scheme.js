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
    publicData: {
        name: {type: Boolean, default:true},
        emails: {type: Boolean, default:true},
        address: {type: Boolean, default:true},
        phones: {type: Boolean, default:true},
        social: {type: Boolean, default:true},
        lastLogin: {type: Boolean, default:true}
    },
    password: {
        type: String,
        minlenght: 8,
        maxlenght: 100
    },
    tagline: {
        type: String,
        maxlenght: 340,
        default: ""
    },
    karma:{
        type: Number,
        default: 0,
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
    palette:{
        key: {
            type: Number,
            default: 0
        },
        pictureHeader: {
            fileName: {
                type: String,
                required: false,
                default: "https://images.unsplash.com/photo-1540228232483-1b64a7024923?ixlib=rb-1.2.1&auto=format&fit=crop&w=967&q=80"
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
                maxLenght: 20,
                default: "link"
            }
        },
        primaryColor: {
            type: String,
            maxLenght: 10,
            default: "#231e39"
        },
        secondaryColor: {
            type: String,
            maxLenght: 10,
            default: "#b3b8cd"
        },
        primaryText: {
            type: String,
            maxLenght: 10,
            default: "#b3b8cd"
        },
        secondaryText: {
            type: String,
            maxLenght: 10,
            default: "#1f1a32"
        },

    },
    
    job: {
        position: {
            type: String,
            default: "enter position"
        },
        workplace: {
            type: String,
            default: "enter workplace"
        }
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
        default: false,
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
    language:{
        type: String,
        maxLenght: 6,
        default:"ES"
    },
    isLogged:{
        type: Boolean,
        default:false
    },
    valorations :[{
        senderId: {
            type: String,
            maxLenght: 500
        },
        value:{
            type: Number
        },
        comment:{
            type: String,
            maxLenght: 500,
        },
        date: {
            type: Date,
            default: Date.now
        },
        accepted: {
            type: Boolean,
            default: false
        },
        rejected: {
            type: Boolean,
            default: false
        }
    }]
});

UserScheme.index({'$**': 'text'}); 
module.exports ={
   UserScheme
}