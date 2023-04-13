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

 module.exports = {
    findConversation,
    createConversation,
    getConversationByUserId,
    getUnreadMessageNumber
 }