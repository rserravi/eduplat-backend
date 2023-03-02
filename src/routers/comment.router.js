const express = require("express");
const {InsertComment, GetCommentsByUserId} = require("../model/comment/comment.model")

const router = express.Router();

router.all("/", (req, res, next) =>{
    //res.json({message: "return from COMMENT router"});
    next();
 });

router.get("/", async (req, res)=>{
    const {userId} = req.body

    const comments = await GetCommentsByUserId(userId);
    console.log(userId, comments)
    if (Object.keys(comments).length !== 0){
        res.json({"status":"success", comments})
    }
    else{
        res.json({"status":"error", "message":"No comments found", comments})
    }
})

router.post("/", async(req, res)=>{
    
    try {
        const {senderId, receiverId, commentText, date} = req.body;
        const commentObj ={
            senderId: senderId,
            receiverId: receiverId,
            commentText: commentText,
            date: Date(date)
        }
        console.log(commentObj.date);
        
        const result = await InsertComment(commentObj);
        if (result){
            res.json({status: "success", message: "New comment created", result});
        }
    } catch (error) {
        res.json ({status: "error", message: error.message})
    }
})

module.exports = router;