const {EdusourceScheme} = require("./edusource.scheme");
const mongoose = require("mongoose")
const mainDataBaseName = process.env.MAIN_DATABASE_NAME;

const insertEdusource = edusourceObj => { 
    return new Promise(async (resolve, reject)=>{ 
 
        const dbConnection = await global.clientConnection
        const db = await dbConnection.useDb(mainDataBaseName)
        const EduSource = await db.model("edusource",EdusourceScheme)
 
        EduSource(edusourceObj)
        .save()
        .then(data => resolve(data))
        .catch(error => reject(error))
    })
 };

 const insertEduValoration = valObj => {
    return new Promise(async (resolve, reject)=>{ 
        
        const dbConnection = await global.clientConnection
        const db = await dbConnection.useDb(mainDataBaseName)
        const EduSource = await db.model("edusource",EdusourceScheme)

        if((!valObj.edusourceId)) return false;
        try{
            EduSource.findByIdAndUpdate(
                valObj.edusourceId,
                { $push: {
                    "valorations" :{
                        "_id": new mongoose.Types.ObjectId(),
                        "edusourceId": valObj.edusourceId,
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

 const getEdusourceByLink = resourceURL =>{
    return new Promise(async (resolve, reject)=>{ 
 
        const dbConnection = await global.clientConnection
        const db = await dbConnection.useDb(mainDataBaseName)
        const EduSource = await db.model("edusource",EdusourceScheme)
 
        if((!resourceURL)) return false;
        try{
            EduSource.findOne({"resourceURL": resourceURL}, (error, data)=>{
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
 };

 const getEdusourceByPromoterId = promoterId =>{
    return new Promise(async (resolve, reject)=>{ 
 
        const dbConnection = await global.clientConnection
        const db = await dbConnection.useDb(mainDataBaseName)
        const EduSource = await db.model("edusource",EdusourceScheme)
 
        //console.log("EN GET RESOURCES", promoterId)
        if((!promoterId)) return false;
        try{
            EduSource.find({"promoterId": promoterId}, (error, data)=>{
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


 module.exports = {
    insertEdusource,
    insertEduValoration,
    getEdusourceByLink,
    getEdusourceByPromoterId
 }