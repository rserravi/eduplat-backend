const mongoose = require("mongoose")
const EdusourceScheme = mongoose.Schema ({
    title: {
        type: String,
        maxLenght: 50,
        required: true
    },
    resourceURL: {
        type: String, 
        maxLenght: 100,
        required: true,
    },
    promoterId: {
        type: String,
        maxLenght: 50,
        required: true
    },
    autors:[{
        autorName : {
            type: String
        },
        autorSocial: [{ 
            media: {
                type: String,
                maxLenght: 30,
            }, 
            user: {
                type: String,
                maxLenght: 30,
            } } ],
    }],
    language:{
        type: String,
        maxLenght: 10,
    },
    discipline: {
        type: String,
        maxLenght: 50,
        required: true
    },
    theme: [String],
    type: {
        type: String,
        maxLenght: 50,
    },
    link: {
        type: String,
        maxLenght: 50,
    },
    linktype: {
        type: String,
        maxLenght: 50,
    },
    description: {
        type: String,
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
    licence: {
        type: String,
        maxLenght: 50,
    },
    date: {
        type: Date
    }, 
    valorations:[]   
});
 
module.exports ={
   EdusourceScheme
}