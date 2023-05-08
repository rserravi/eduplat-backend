const { addKarma } = require("../../utils/karmaHandler.js");
const { getConversationByUserId, getUnreadMessageNumber } = require("../conversation/conversation.model.js");
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
            //console.log("TRYING")
            User.findOne({"_id": userId}, async (error, data)=>{
            if(error){
                reject(error);
            }
            const alerts = await getAlerts(data);
            const user = {...data, alerts}
            resolve(user)
            }
        ).clone().lean();
        } catch (error) {
            reject(error);
        }
    });
 };

const getAlerts = user =>{
    return new Promise(async (resolve, reject)=>{
        var userValorations = 0;
       //console.log("GET ALERTS USER.VALORATIONS", user.valorations);
        if (user.valorations.length > 0){
            for (let val = 0; val < user.valorations.length; val++) {
                if (!user.valorations[val].accepted) {
                    userValorations = userValorations+1
                }
            }
        }

        var resourceValorations = 0;
        try {
            const edusources = await getEdusourceByPromoterId(user._id);
            for (let edu = 0; edu < edusources.length; edu++) {
                for (let val = 0; val < edusources[edu].valorations.length; val++) {
                    if (!edusources[edu].valorations[val].accepted && !edusources[edu].valorations[val].rejected){
                        resourceValorations = resourceValorations+1;
                    }
                }
            }

        } catch (error) {
            reject(error);
        }

        var messagesUnreaded = 0;
        try {
            const conversations = await getConversationByUserId(user._id);
            console.log("CONVERSATIONS in GETALERTS");
            for (let convers = 0; convers < conversations.length; convers++) {
                messagesUnreaded+= getUnreadMessageNumber(conversations[convers], user._id)
                
            }
            
        } catch (error) {
            reject(error)
        }



        const alerts = {
            user: userValorations,
            resource: resourceValorations,
            message: messagesUnreaded,
            promo: 0,
            recomendation: 0,
            total: userValorations + resourceValorations + messagesUnreaded
        }
       
        resolve(alerts);
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

const getIdByEmail = email =>{
    //console.log("GET USER BY USERNAME ", username)
    return new Promise(async (resolve,reject)=>{

        const dbConnection = await global.clientConnection
        const db = await dbConnection.useDb(mainDataBaseName)
        const User = await db.model("user",UserScheme)

        if((!email)) return false;
        try{
            const val2 = `\"${email}\"`
            User.findOne({"emails.emailUrl":email}, (error, data)=>{
            if(error){
                reject(error);
            }
            
            resolve(data._id);
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
                    //console.log(data);
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
                {'emails.emailUrl':email},
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
            console.log("ERROR EN FINDOINEANDUPDATE", error);
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
                    console.log("DATA EN UPDATE USER",data);
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
        const regex = new RegExp("^" + username + "$", "i")
        
        try{
            User.find({"username": regex}, (error, data)=>{
            if(error){
                reject(error);
            }
            else{
                //console.log("CHECK USER RESULT: ",data);
                if (data.length>0){
                    if (data[0].username === username){
                        resolve(data)
                    }
                    else {
                        reject(data)
                    }
                }else{
                    reject(data)
                }
               
            }
            }
        ).lean().clone();
        } catch (error) {
            reject(error);
        }
    })
 }

 const checkEmail = (email) =>{
    return new Promise(async (resolve,reject)=>{

        const dbConnection = await global.clientConnection
        const db = await dbConnection.useDb(mainDataBaseName)
        const User = await db.model("user",UserScheme)

        if((!email)) return false;
        const regex = new RegExp("^" + email + "$", "i")
        
        try{
            User.find({"emails.emailUrl":  email}, (error, data)=>{
            if(error){
                reject(error);
            }
            else{
                //console.log("CHECK EMAIL RESULT: ",data);
                if (data.length>0){
                    var found = false
                    for (let index = 0; index < data[0].emails.length; index++) {
                        if (data[0].emails[index].emailUrl===email){
                            found = true;
                        }
                        
                    }
                    if (found){
                        resolve(data)
                    }
                    else {
                        reject(data)
                    }
                }else{
                    reject(data)
                }
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

        //console.log("OBJETO EN INSERTUSERVALORATION",valObj);

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
                async (error, data)=>{
            if(error){
                console.log(error);
                reject(error);
            }
            else{
                await addKarma(valObj.senderId, process.env.KARMA_FOR_USER_VALORATION)
                //console.log(data);
                resolve(data);
            }
            }
        ).lean().clone();
        } catch (error) {
            reject(error);
        }
        
        
    })
 }

 const updateUserValoration = (userId, senderId, value, comment) =>{
    return new Promise(async (resolve, reject)=>{ 
        
        const dbConnection = await global.clientConnection
        const db = await dbConnection.useDb(mainDataBaseName)
        const User = await db.model("user",UserScheme)
        
        //console.log("OBJETOs EN updateUserValoration",userId, senderId, value, comment);

        if((!userId)) return false;

        const user = await getUserbyId(userId);
        const valorations = user.valorations;

        for (let index = 0; index < valorations.length; index++) {
            if (valorations[index].senderId === senderId){
                valorations[index].value = value;
                valorations[index].comment = comment;
                break;
            }
            
        }

        try{
            User.findByIdAndUpdate(
                userId,
                { 
                    "valorations" : valorations
                },
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

 const acceptRejectUserValoration =(accepted, rejected, user_id, val_id)=>{
    console.log("ACCEPT REJECT")
    return new Promise(async (resolve,reject)=>{

        const dbConnection = await global.clientConnection
        const db = await dbConnection.useDb(mainDataBaseName)
        const User = await db.model("user",UserScheme)

        if((!user_id) || !val_id) return false;
       
        console.log(user_id);
        //try{
            
            const usor = await User.findById(user_id);
            
            if (!usor) reject({"status":"error", "message":"No user found"})

            var valorations = [... usor.valorations]
            console.log("VALORACIONES DEL USUARIO",valorations)

            for (let val = 0; val < valorations.length; val++) {
                console.log(valorations[val]._id.toString(), val_id)
                if (valorations[val]._id.toString()===val_id){
                    valorations[val].accepted = accepted,
                    valorations[val].rejected = rejected
                    console.log("VALORACIONES CAMBIADAS",valorations[val])
                    
                    usor.valorations = valorations
                    usor.save().then((newData)=>{
                        resolve(newData)
                    }).catch((error)=>{
                        console.log("Error en Update", error);
                        reject(error);
                    })
                }
                
            }            
        
       /*  } catch (error) {
            console.log("NOT FOUND _ID")
            reject(error);
        } */
    });
 }


 const acceptedValorations = (user)=>{
    var count = 0;
    //console.log ("USER recibida en ACCEPTEDVALORATIONS", user)
    if (user.valorations && user.valorations!==undefined && user.valorations!==null){
        for (let val = 0; val < user.valorations.length; val++) {
            //console.log("VALORACION DE USUARIO", user.valorations[val])
            if (user.valorations[val].accepted){
                count++;
            }
        }
    }
    else{
        console.log("SIN VALORACIONES");
    }
    return count;
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

    //console.log(newString)

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
        //console.log (regx);
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
                        valorationsCount: acceptedValorations(data[i])
                    }

                    //console.log("USUARIO EN NEWUSER", data[i])
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

 const getAllUsers = () =>{
    
    return new Promise(async (resolve,reject)=>{

        const dbConnection = await global.clientConnection
        const db = await dbConnection.useDb(mainDataBaseName)
        const User = await db.model("user",UserScheme)

        try{
            User.find({}, (error, data)=>{
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

const setAllVerifiedTrue = ()=>{
    return new Promise(async (resolve,reject)=>{

        const dbConnection = await global.clientConnection
        const db = await dbConnection.useDb(mainDataBaseName)
        const User = await db.model("user",UserScheme)

        try{
            User.updateMany({},{isVerified:true}, (error, data)=>{
            if(error){
                reject(error);
            }
            
            resolve(data);
            }
        ).lean().clone();
        } catch (error) {
            reject(error);
        }
    });
}

const setBoss = (username)=>{
    return new Promise(async (resolve, reject)=>{

        const dbConnection = await global.clientConnection
        const db = await dbConnection.useDb(mainDataBaseName)
        const User = await db.model("user",UserScheme)

        try {
            User.findOneAndUpdate(
                {username : username},
                {$set: {"isBoss": true}},
                {new: true}, (error, data) =>{
                    if(error){
                        reject(error);
                    }
                    resolve(data);
                    //console.log(data);
                    }
            ).clone();
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
   checkEmail,
   searchUsers,
   includeAccents, 
   insertUserValoration,
   updateUserValoration,
   acceptRejectUserValoration,
   getAllUsers,
   getIdByEmail,
   setAllVerifiedTrue,
   setBoss
};