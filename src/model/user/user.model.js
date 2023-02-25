const {UserScheme} = require("./user.scheme.js");
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
 
 
 
module.exports = {
   insertUser,
   getUserbyEmail,
   getUserbyId,
   storeUserRefreshJWT,
   updatePassword,
   verifyUser,
   updateUser
};