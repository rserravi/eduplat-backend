const {UserScheme} = require("../model/user/user.scheme");
const mainDataBaseName = process.env.MAIN_DATABASE_NAME;

const addKarma = (senderId, karma)=>{
    return new Promise(async (resolve,reject)=>{

        const dbConnection = await global.clientConnection
        const db = await dbConnection.useDb(mainDataBaseName)
        const User = await db.model("user",UserScheme)

        if((!senderId)) return false;
        try{
            User.findByIdAndUpdate(
                senderId,
                { 
                    $inc: {karma:  parseInt(karma)}
                },
                {new: true},
                (error, otherData)=>{
            if(error){
                console.log(error);
                reject(error);
            }
            else{
                resolve(otherData)
                //console.log(otherData);
            }
            }
        ).lean().clone();
        } catch (error) {
            reject(error);
        }
    })
 }

 const getUserbyIdV2 = userId =>{
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
            resolve(data)
            }
        ).clone().lean();
        } catch (error) {
            reject(error);
        }
    });
 };

 module.exports = {
    addKarma, 
    getUserbyIdV2
}