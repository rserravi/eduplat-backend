const {CollectionScheme} = require("./collection.scheme");
const mainDataBaseName = process.env.MAIN_DATABASE_NAME;
const { UserScheme } = require("../user/user.scheme");
const mongoose = require("mongoose");
const { addKarma } = require("../../utils/karmaHandler");



const insertCollection = collectionObj => { 
    return new Promise(async (resolve, reject)=>{ 
 
        const dbConnection = await global.clientConnection
        const db = await dbConnection.useDb(mainDataBaseName)
        const Collection = await db.model("collection",CollectionScheme)
 
        Collection(collectionObj)
        .save()
        .then(data => resolve(data))
        .catch(error => reject(error))
    })
 };

 const getCollectionById = id =>{
    return new Promise(async (resolve, reject)=>{ 

        console.log("ID EN GETCOLLECTION BY ID",id)
 
        const dbConnection = await global.clientConnection
        const db = await dbConnection.useDb(mainDataBaseName)
        const Collection = await db.model("collection",CollectionScheme)
        const UserSource = await db.model("user", UserScheme)

 
        try {
            Collection.findById(id, async (error, data)=>{
                    if(error){
                        console.log("ERROR EN getCollectionById - 1",error);
                        reject(error);
                    }
                    else{
                        //console.log("DATOS EN getCollectionById-1",data);
                        resolve(data);
                    }
                }
            ).populate({path:"promoterId", select:'username firstname lastname picture'}).lean().clone();
            
        } catch (error) {
            console.error(error);
            reject(error)
        }
    })
 }

 const getCollectionByUrl = url =>{
    return new Promise(async (resolve, reject)=>{ 
 
        const dbConnection = await global.clientConnection
        const db = await dbConnection.useDb(mainDataBaseName)
        const Collection = await db.model("collection",CollectionScheme)
        const UserSource = await db.model("user", UserScheme)

 
        try {
            Collection.findOne({"collectionURL":url}, async (error, data)=>{
                    if(error){
                        console.log("ERROR EN getCollectionByUrl",error);
                        reject(error);
                    }
                    else{
                        console.log("DATOS EN getCollectionByUrl",data);
                        resolve(data);
                    }
                }
            ).populate({path:"promoterId", select:'username firstname lastname picture'}).lean().clone();
            
        } catch (error) {
            console.error(error);
            reject(error)
        }
    })
 }

  const markAsSeen = (collectionId, contentId, userId) =>{
    return new Promise(async (resolve, reject)=>{ 
 
        const dbConnection = await global.clientConnection
        const db = await dbConnection.useDb(mainDataBaseName)
        const Collection = await db.model("collection",CollectionScheme)
 
        console.log(collectionId, contentId, userId);
        try {
            const doc = await Collection.findById(collectionId);
            for (let i = 0; i < doc.content.length; i++) {
                if (doc.content[i]._id.toString() === contentId){
                    
                    if (doc.content[i].visitedBy.indexOf(userId)===-1){
                        doc.content[i].visitedBy.push(userId)
                    }
                    else {
                        
                        resolve({status:"success", message:"User alreary there"})
                    }
                    break
                }
                
            }
            await doc.save();
            resolve({status:"success", message:"Marked as seen"})
        
            
        } catch (error) {
            console.error(error);
            reject(error)
        }
    })
 }

 const checkedMark = (collectionId, contentId, userId) =>{
    return new Promise(async (resolve, reject)=>{ 
 
        const dbConnection = await global.clientConnection
        const db = await dbConnection.useDb(mainDataBaseName)
        const Collection = await db.model("collection",CollectionScheme)
 
        console.log(collectionId, contentId, userId);
        try {
            const doc = await Collection.findById(collectionId);
            for (let i = 0; i < doc.content.length; i++) {
                if (doc.content[i]._id.toString() === contentId){
                    const marked = (doc.content[i].visitedBy.indexOf(userId)!==-1)
                    resolve({status:"success", marked})
                    break;
                    
                }   
            }
            resolve({status:"success", message:"Marked as seen"})
        
            
        } catch (error) {
            console.error(error);
            reject(error)
        }
    })
 }

 const getCollecionValoration = (userId, collectionId) =>{
    return new Promise(async (resolve, reject)=>{ 

        const dbConnection = await global.clientConnection
        const db = await dbConnection.useDb(mainDataBaseName)
        const Collection = await db.model("collection",CollectionScheme)
 
        try{
            Collection.findOne({
                "_id": collectionId,
                "valorations.senderId": userId
            }, (error, data)=>{
            if(error){
                console.log(error);
                reject(error);
            }
            else{
                console.log("DATA EN GETCOLLECTIONVALORATION",data);
                const val= data.valorations;
                for (let index = 0; index < val.length; index++) {
                    if (val[index].senderId===userId){
                        console.log(val[index])
                        resolve(val[index])
                    }
                    
                }
                resolve("ERROR en Model GetCollectionValoration");
            }
            }
        ).lean().clone();
        } catch (error) {
            reject(error);
        } 
    })
 }
 
 const insertCollectionValoration = valObj => {
    return new Promise(async (resolve, reject)=>{ 
        
        const dbConnection = await global.clientConnection
        const db = await dbConnection.useDb(mainDataBaseName)
        const Collection = await db.model("collection",CollectionScheme)

        if((!valObj.collectionId)) return false;
        try{
            Collection.findByIdAndUpdate(
                valObj.collectionId,
                { $push: {
                    "valorations" :{
                        "_id": new mongoose.Types.ObjectId(),
                        "collectionId": valObj.collectionId,
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
                await addKarma(valObj.senderId, process.env.KARMA_FOR_COLLECTION_VALORATION)
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

 const updateCollectionValoration =(_id, senderId, value, comment, collectionId)=>{
    return new Promise(async (resolve, reject)=>{ 
        
        const dbConnection = await global.clientConnection
        const db = await dbConnection.useDb(mainDataBaseName)
        const Collection = await db.model("collection",CollectionScheme)

        const collection=await getCollectionById(collectionId);
        
        const valorations = collection.valorations;

            for (let i = 0; i < valorations.length; i++) {
                //console.log("ITERACION ", i, valorations[i]._id.toString(), _id )
                if (valorations[i]._id.toString() === _id){
                    valorations[i].value = value;
                    valorations[i].comment = comment;
                    break;
                }
                
            }
            
            //console.log("VALORATIONS", valorations);
        
        
        try{
            Collection.findByIdAndUpdate(
                collectionId,
                { 
                    "valorations" : valorations
                },
                async (error, data)=>{
            if(error){
                console.log(error);
                reject(error);
            }
            else{
               // await addKarma(senderId, KARMA_FOR_EDUSOURCE_VALORATION)
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
 
 module.exports = {
   insertCollection,
   getCollectionById,
   getCollectionByUrl,
   markAsSeen,
   checkedMark,
   getCollecionValoration,
   insertCollectionValoration,
   updateCollectionValoration
 }