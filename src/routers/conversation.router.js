const express = require("express");
const { createConversation, findConversation, getConversationByUserId, getUnreadMessageNumber, markConversationAsReaded } = require("../model/conversation/conversation.model");
const { getUserbyIdV2 } = require("../utils/karmaHandler");

const router = express.Router();

router.all("/", (req, res, next) =>{
    //res.json({message: "return from Conversation router"});
    res.header('Access-Control-Allow-Origin', '*');
    next();
 });

router.post("/", async (req, res)=>{
    const {senderId, receiverId, message} = req.body;
    try {
        const conversation = await findConversation(senderId, receiverId, message)
        console.log ("THIS IS THE CONVERSATION - 2", conversation);
        if (conversation && conversation._id!==null && conversation._id!==undefined){
            res.json({status: "success", message: "Message added to existing conversation"});
        }
        else {
            console.log("ESTAMOS EN EL ELSE?")
            const sender = await getUserbyIdV2(senderId);
            const receiver = await getUserbyIdV2(receiverId);
      
            const conversationObj={
                "time": Date.now(),
                "members":[
                    {
                        "userId": senderId,
                        "username": sender.username,
                        "picture": {
                            "fileName": sender.picture.fileName,
                            "file": sender.picture.file,
                            "type": sender.picture.type
                        }
                    },
                    {
                        "userId": receiverId,
                        "username": receiver.username,
                        "picture": {
                            "fileName": receiver.picture.fileName,
                            "file":receiver.picture.file,
                            "type": receiver.picture.type
                        }
                    },
                ],
                "messages":[
                    {
                        "senderId": senderId,
                        "message": message,
                        "timestamp":  Date.now()
                    }
                ],
                "archived":false
            }
            const newConversation = await createConversation(conversationObj)
            res.json({status: "success", message: "Message added to a new conversation"});
        }
        //console.log("Insert User Valoration",result);
       
 
    } catch(err){
        console.log(err)
        let message = "Unable to create pr update the conversation at the moment. Pleaset contact administrator"
        res.json({status:"error", message});
    }
})

router.get("/", async (req, res)=>{
    const {userid} = req.query;
    try {
        await getConversationByUserId(userid).then((conversation)=>{
            res.json({status: "success", conversation });
        }).catch((err)=>{
            res.json({status:"error", err});
        })

    } catch (error) {
        res.json({status:"error", error});
    }
})

router.patch("/", async (req, res)=>{
    const {conversationId} = req.body;
    const {userId}= req.body;
    console.log("USER ID ES", userId)
    try {
        await markConversationAsReaded(conversationId, userId).then((data)=>{
            res.json({status: "succes", message:"Conversation updated"})
        }).catch((err)=>{
            res.json({status:"error", err})
        })
        
    } catch (error) {
        res.json({status:"error", error})
    }
})

module.exports = router;