const express = require("express");
const { supportMail } = require("../helpers/email.helpers");

const router = express.Router();

router.all("/", (req, res, next) =>{
    res.json({message: "return from Email router"});
    res.header('Access-Control-Allow-Origin', '*');
    next();
 });

router.post("/support", async (req, res)=>{
    const {sender, subject, message}= req.body
    console.log(req.body);
    await supportMail(sender, subject, message).then((info)=>{
        console.log("INFO RECEIVED IN SUPPORT",info);
        if (info.accepted && info.accepted!==null && info.accepted!==undefined){
            res.json ({status:"success", info});
        }
        else{
            res.json ({status:"error", message:"We are not able to send the mail rigth now. Try again later"});
        }
    }).catch((err)=>{
        res.json ({status:"error", message:err.message});
    })
   
})


module.exports = router;