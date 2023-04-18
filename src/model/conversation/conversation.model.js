const {ConversationScheme} = require("./conversation.scheme");
//const mongoose = require("mongoose")
const mainDataBaseName = process.env.MAIN_DATABASE_NAME;

const findConversation = (user1, user2, theMessage) =>{
    return new Promise(async (resolve, reject)=>{ 
 
        const dbConnection = await global.clientConnection
        const db = await dbConnection.useDb(mainDataBaseName)
        const ConversationSource = await db.model("conversation",ConversationScheme)

        const message = {
            "senderId":user1, 
            "message": theMessage,
        }

        try {
            ConversationSource.findOneAndUpdate({
                
                    "members.userId": {
                      $all: [user1,user2]
                    }
                  
                },
                {$push: {messages:message}}, {new: true}, async (error, data)=>{
                        if(error){
                            console.log("ERROR EN FINDCONVERSATION - 1",error);
                            reject(error);
                        }
                        else{
                            console.log("DATOS EN FINDCONVERSATION -1",data);
                            resolve(data);
                        }
                    }
                
            ).lean().clone();
            
        } catch (error) {
            console.error(error);
            reject(error)
        }
    })
}

const createConversation = conversationObj => { 
    return new Promise(async (resolve, reject)=>{ 
 
        const dbConnection = await global.clientConnection
        const db = await dbConnection.useDb(mainDataBaseName)
        const ConversationSource = await db.model("conversation",ConversationScheme)
 
        ConversationSource(conversationObj)
        .save()
        .then(data => resolve(data))
        .catch(error => reject(error))
    })
 };

 const getConversationByUserId = userid =>{
    return new Promise(async (resolve, reject)=>{ 
 
        const dbConnection = await global.clientConnection
        const db = await dbConnection.useDb(mainDataBaseName)
        const ConversationSource = await db.model("conversation",ConversationScheme)
 
        try {
            ConversationSource.find(
                {"members": { $elemMatch: { userId: userid}}}, 
                
                async (error, data)=>{
                    if(error){
                        console.log("ERROR EN getConversationByUserId - 1",error);
                        reject(error);
                    }
                    else{
                        console.log("DATOS EN getConversationByUserId -1",data);
                        resolve(data);
                    }
                }
            ).lean().clone();
            
        } catch (error) {
            console.error(error);
            reject(error)
        }
    })
 }


 const getUnreadMessageNumber = (conversation, sender) =>{
    var unread = 0;
    //console.log("DATOS en getUnreadMessageNumber", conversation, sender)
    const messages = conversation.messages;
    for (let message = 0; message < messages.length; message++) {
        //console.log("ITERACION: ",message,". SENDER",sender,".SENDERiD:",messages[message].senderId);
        if (messages[message].senderId !== sender.toString() && !messages[message].readed){
            unread++
        }
        
    }

    return unread;
 }

 const getConversationById = (conversationId) => {
    return new Promise(async(resolve, reject)=>{
        const dbConnection = await global.clientConnection
        const db = await dbConnection.useDb(mainDataBaseName)
        const ConversationSource = await db.model("conversation",ConversationScheme)

        try {
            ConversationSource.find({"_id": conversationId}, async (error, data)=>{
                if(error){
                    reject(error);
                }
                resolve(data)
                }
            ).clone().lean();
            
        } catch (error) {
            console.error(error);
            reject(error)
        }
    })
 }

 const markConversationAsReaded = (conversationId, userId) =>{
    return new Promise(async (resolve, reject)=>{ 
 
        const dbConnection = await global.clientConnection
        const db = await dbConnection.useDb(mainDataBaseName)
        const ConversationSource = await db.model("conversation",ConversationScheme)

        const conversation = await getConversationById(conversationId)
        var newMessages = conversation[0].messages.map((x)=>x)
        for (let i = 0; i < newMessages.length; i++) {
            console.log("SENDERID", newMessages[i].senderId, "UserId", userId)
            if (newMessages[i].senderId!==userId){
                newMessages[i].readed = true;
            }
        }
           
 
        try {
            ConversationSource.findOneAndUpdate({"_id": conversationId}, {"messages": newMessages}, async (error, data)=>{
                if(error){
                    reject(error);
                }
                resolve(data)
                }
            ).clone().lean();
            
        } catch (error) {
            console.error(error);
            reject(error)
        }
    })
 }

 module.exports = {
    findConversation,
    createConversation,
    getConversationByUserId,
    getUnreadMessageNumber,
    getConversationById,
    markConversationAsReaded
 }