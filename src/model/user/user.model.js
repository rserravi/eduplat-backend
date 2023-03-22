const { getEdusourceByPromoterId } = require("../edusource/edusource.model.js");
const {UserScheme} = require("./user.scheme.js");
const mongoose = require("mongoose")
const mainDataBaseName = process.env.MAIN_DATABASE_NAME;

const insertUser = userObj => { 
    return new Promise(async (resolve, reject)=>{ 
 
        const dbConnection = await global.clientConnection
        const db = await dbConnection.useDb(mainDataBaseName)
        const User = await db.model("user",UserScheme)
 
        User(userObj)
        .save()
        .then(data => resolve(data))
        .catch(error => reject(error))
    })
 };

 const getUserbyEmail = email =>{
    return new Promise(async (resolve,reject)=>{

        const dbConnection = await global.clientConnection
        const db = await dbConnection.useDb(mainDataBaseName)
        const User = await db.model("user",UserScheme)

        if((!email)) return false;
        try{
            User.findOne({'emails.emailUrl':email}, (error, data)=>{
            if(error){
                resolve(error);
            }
            resolve(data);
            })
        } catch (error) {
            reject(error);
        }
    });
 };

 const getUserbyId = userId =>{
    console.log("GET USER BY ID ", userId)
    return new Promise(async (resolve,reject)=>{

        const dbConnection = await global.clientConnection
        const db = await dbConnection.useDb(mainDataBaseName)
        const User = await db.model("user",UserScheme)

        if((!userId)) return false;
        try{
            console.log("TRYING")
            User.findOne({"_id": userId}, (error, data)=>{
            if(error){
                reject(error);
            }
            resolve(data);
            }
        ).clone();
        } catch (error) {
            reject(error);
        }
    });
 };

const getUserbyUserName = username =>{
    console.log("GET USER BY USERNAME ", username)
    return new Promise(async (resolve,reject)=>{

        const dbConnection = await global.clientConnection
        const db = await dbConnection.useDb(mainDataBaseName)
        const User = await db.model("user",UserScheme)

        if((!username)) return false;
        try{
            console.log("TRYING")
            User.findOne({"username": username}, (error, data)=>{
            if(error){
                reject(error);
            }
            resolve(data);
            }
        ).clone();
        } catch (error) {
            reject(error);
        }
    });
};
 
 

const storeUserRefreshJWT = (_id, token) => {

    console.log("ID y TOKEN EN STORE REFRESH EN MONGO",_id, token);
    return new Promise(async (resolve, reject)=>{

        const dbConnection = await global.clientConnection
        const db = await dbConnection.useDb(mainDataBaseName)
        const User = await db.model("user",UserScheme)

        try {
            User.findOneAndUpdate(
                {_id},
                {$set: {"refreshJWT.token": token, "refreshJWT.addedAt": Date.now()}},
                {new: true}, (error, data) =>{
                    if(error){
                        reject(error);
                    }
                    resolve(data);
                    console.log(data);
                    }
            ).clone();
        } catch (error) {
            reject(error);       
        }
    })
}
 
const updatePassword = (email, newHashedPass) =>{
    return new Promise(async (resolve,reject)=>{

        const dbConnection = await global.clientConnection
        const db = await dbConnection.useDb(mainDataBaseName)
        const User = await db.model("user",UserScheme)

        try {
            User.findOneAndUpdate(
                {email},
                {$set:{"password": newHashedPass}},
                {new: true}, (error, data) =>{
                    if(error){
                        reject(error);
                    }
                    resolve(data);
                    console.log(data);
                    }
            ).clone();
        } catch (error) {
            reject(error);       
        }
    })
 }

const verifyUser = (randomURL,email) =>{
    return new Promise(async (resolve,reject)=>{

        const dbConnection = await global.clientConnection
        const db = await dbConnection.useDb(mainDataBaseName)
        const User = await db.model("user",UserScheme)

        try {
            User.findOneAndUpdate(
                {randomURL, email},
                {$set:{"isVerified": true}}
                )
                    .then((data)=> {
                        resolve(data);
                    })
                    .catch((error)=> {
                        console.log(error);
                        reject(error);
                    })
        } catch (error) {
            console.log(error);
            reject(error);       
        }
    })
}

const updateUser = (_id, userObj) =>{
    return new Promise(async (resolve,reject)=>{

        const dbConnection = await global.clientConnection
        const db = await dbConnection.useDb(mainDataBaseName)
        const User = await db.model("user",UserScheme)

        try {
            User.findByIdAndUpdate(
                {_id},
                {$set: userObj},
                {new: true}, (error, data) =>{
                    if(error){
                        reject(error);
                    }
                    resolve(data);
                    console.log(data);
                    }
            ).clone();
        } catch (error) {
            reject(error);       
        }
    })
 }

 const checkUser = (username) =>{
    return new Promise(async (resolve,reject)=>{

        const dbConnection = await global.clientConnection
        const db = await dbConnection.useDb(mainDataBaseName)
        const User = await db.model("user",UserScheme)

        if((!username)) return false;
        try{
            User.find({"username": username}, (error, data)=>{
            if(error){
                reject(error);
            }
            else{
                console.log(data);
                resolve(data);
            }
            }
        ).lean().clone();
        } catch (error) {
            reject(error);
        }
    })
 }
 //BODY:  userId, senderId, comment, value, date, accepted.
 const insertUserValoration = valObj => {
    return new Promise(async (resolve, reject)=>{ 
        
        const dbConnection = await global.clientConnection
        const db = await dbConnection.useDb(mainDataBaseName)
        const User = await db.model("user",UserScheme)

        console.log("OBJETO EN INSERTUSERVALORATION",valObj);

        if((!valObj.userId)) return false;
        try{
            User.findByIdAndUpdate(
                valObj.userId,
                { $push: {
                    "valorations" :{
                        "_id": new mongoose.Types.ObjectId(),
                        "senderId": valObj.senderId,
                        "comment": valObj.comment,
                        "value": valObj.value,
                        "date:": valObj.date,
                        "accepted:": valObj.accepted
                    }
                }},
                {new: true},
                (error, data)=>{
            if(error){
                console.log(error);
                reject(error);
            }
            else{
                console.log(data);
                resolve(data);
            }
            }
        ).lean().clone();
        } catch (error) {
            reject(error);
        }
    })
 }

 const includeAccents= terms => {

    var newString = "";
    for (let i = 0; i< terms.length; i++) {
      const character = terms[i].toLowerCase();
      var newChar= character
      if (character==="a" || character ==="à" || character==='á' || character === 'ä'){
        newChar = '[aàáä]'
      }

      if (character==="e" || character ==="è" || character==='é' || character === 'ë'){
        newChar = '[eèéë]'
      }

      if (character==="i" || character ==="ì" || character==='í' || character === 'ï'){
        newChar = '[iìíï]'
      }

      if (character==="o" || character ==="ò" || character==='ó' || character === 'ö'){
        newChar = '[oòóö]'
      }

      if (character==="u" || character ==="ù" || character==='ú' || character === 'ü'){
        newChar = '[uùúü]'
      }

      if (character==="n" || character ==="ñ"){
        newChar = '[nñ]'
      }

      if (character==="c" || character ==="ç"){
        newChar = '[cç]'
      }

      if (character ==="b" || character ==="v"){
        newChar = '[vb]'
      }

      newString+=newChar;
    }

    console.log(newString)

    return newString;
}

 const searchUsers = (terms, lang) =>{
    return new Promise(async (resolve,reject)=>{

        const dbConnection = await global.clientConnection
        const db = await dbConnection.useDb(mainDataBaseName)
        const User = await db.model("user",UserScheme)
       
        var searchString="";

        if((!terms)) return false;

        const newTerms = includeAccents(terms);

        const regx = {$regex: newTerms, $options: 'i'}
        console.log (regx);
        if (lang==="any" || lang==="ANY"){
            searchString = {
                $or: [
                    {username: regx},
                    {firstname: regx},
                    {lastname: regx},
                    {tagline: regx},
                    {emails: { $elemMatch: { emailUrl: regx}}},
                    {social: { $elemMatch: { user: regx}}},
                    {job: { $elemMatch: { position: regx}}},
                    {job: { $elemMatch: { workplace: regx}}}
                    ]
            }
        }
        else {
            searchString = {
                language: lang.toUpperCase(),
                $and: [
                {$or: [
                    {username: regx},
                    {firstname: regx},
                    {lastname: regx},
                    {tagline: regx},
                    {emails: { $elemMatch: { emailUrl: regx}}},
                    {social: { $elemMatch: { user: regx}}},
                    {job: { $elemMatch: { position: regx}}},
                    {job: { $elemMatch: { workplace: regx}}}
                    ]}]
                }
        }
        
        try{
            //User.find({$text: {$search: query}}, (error, data)=>{
            User.find(searchString, async (error, data)=>{
            if(error){
                reject(error);
            }
            else{
                var newArray = [];
                for (let i = 0; i < data.length; i++) {
                    var resourcesCount = 0;
                    await getEdusourceByPromoterId(data[i]._id).then((res)=>{
                        resourcesCount = res.length;
                    }).catch(()=>{
                        resourcesCount= 400
                    })
            
                    const newUser = {
                        _id:  data[i]._id,
                        username: data[i].username,
                        firstname: data[i].firstname,
                        lastname: data[i].lastname,
                        publicData: data[i].publicData,
                        tagline: data[i].tagline,
                        editingLevel: data[i].editingLevel,
                        karma: data[i].karma,
                        picture: data[i].picture,
                        job: data[i].job,
                        emails: data[i].emails,
                        address: data[i].address,
                        phones: data[i].phones,
                        social: data[i].social,
                        language: data[i].language,
                        resourcesCount: resourcesCount,
                        collectionsCount: 0,
                        valorationsCount: data[i].valorations?data[i].valorations.length:0
                    }
                    newArray.push(newUser);

                }

                //OLD RETURN
                //resolve(data);

                resolve(newArray);
            }
            }
        ).lean().clone();
        } catch (error) {
            reject(error);
        }
    })
 }
 
 
module.exports = {
   insertUser,
   getUserbyEmail,
   getUserbyId,
   getUserbyUserName,
   storeUserRefreshJWT,
   updatePassword,
   verifyUser,
   updateUser,
   checkUser,
   searchUsers,
   includeAccents, 
   insertUserValoration
};