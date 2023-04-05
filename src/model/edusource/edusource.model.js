const {EdusourceScheme} = require("./edusource.scheme");
const mongoose = require("mongoose");
const { getUserbyId } = require("../user/user.model");
const { UserScheme } = require("../user/user.scheme");
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

 const promoterDataFromResource = (edusource)=>{
    return new Promise(async (resolve, reject)=>{
        try {
            const promoter = await getUserbyId(edusource.promoterId).then((prom)=>{
                const promoterData = {
                    promoterName: prom.username,
                    promoterAvatar: prop.picture.fileName
                }
            })
        } catch (error) {
            reject(error);
        }

    })
    
 }

 const getLastResources = ()=>{
    return new Promise(async (resolve, reject)=>{ 
 
        const dbConnection = await global.clientConnection
        const db = await dbConnection.useDb(mainDataBaseName)
        const EduSource = await db.model("edusource",EdusourceScheme)
        const UserSource = await db.model("user", UserScheme)
         
        try{
            EduSource.find({}, async (error, data)=>{
            if(error){
                console.log(error);
                reject(error);
            }
            else{
                console.log("LAST RESOURCES",data);
                resolve(data);
            }
            }
        ).populate({path:"promoterId", select:'username firstname lastname picture'}).lean().clone().sort({_id: -1 }).limit(10)
        } catch (error) {
            reject(error);
        }
    })
 }

 const getValoration = (userId, edusourceId) =>{
    return new Promise(async (resolve, reject)=>{ 
 
        const dbConnection = await global.clientConnection
        const db = await dbConnection.useDb(mainDataBaseName)
        const EduSource = await db.model("edusource",EdusourceScheme)
 
        try{
            EduSource.findOne({
                "_id": edusourceId,
                "valorations.senderId": userId
            }, (error, data)=>{
            if(error){
                console.log(error);
                reject(error);
            }
            else{
                console.log(data); 
                const val= data.valorations;
                for (let index = 0; index < val.length; index++) {
                    if (val[index].senderId===userId){
                        console.log(val[index])
                        resolve(val[index])
                    }
                    
                }
                resolve("ERROR en Model GetValoration");
            }
            }
        ).lean().clone();
        } catch (error) {
            reject(error);
        } 
    })
 }

 const getEdusourcebyId = edusourceId =>{
    console.log("GET EDUSOURCE BY ID ", edusourceId)
    return new Promise(async (resolve,reject)=>{

        const dbConnection = await global.clientConnection
        const db = await dbConnection.useDb(mainDataBaseName)
        const EduSource = await db.model("edusource",EdusourceScheme)

        if((!edusourceId)) return false;
        try{
            console.log("TRYING")
            EduSource.findOne({"_id": edusourceId}, async (error, data)=>{
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

 const updateValoration = (senderId, edusourceId, value, comment)=>{
    return new Promise(async (resolve, reject)=>{ 
        
        const dbConnection = await global.clientConnection
        const db = await dbConnection.useDb(mainDataBaseName)
        const EduSource = await db.model("edusource",EdusourceScheme)
        
        //console.log("OBJETOs EN updateValoration",userId, senderId, value, comment);

        if((!edusourceId)) return false;

        const edusource = await getEdusourcebyId(edusourceId);
        console.log(edusource)
        const valorations = edusource.valorations;

        for (let index = 0; index < valorations.length; index++) {
            if (valorations[index].senderId === senderId){
                valorations[index].value = value;
                valorations[index].comment = comment;
                break;
            }
            
        }

        try{
            EduSource.findByIdAndUpdate(
                edusourceId,
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


 module.exports = {
    insertEdusource,
    insertEduValoration,
    getEdusourceByLink,
    getEdusourceByPromoterId,
    getLastResources,
    getValoration,
    updateValoration
 }