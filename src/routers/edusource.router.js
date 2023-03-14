const express = require("express");
const {insertEdusource, getEdusourceByLink, insertEduValoration, getEdusourceByPromoterId} = require('../model/edusource/edusource.model');
const { getUserbyId } = require("../model/user/user.model");

const router = express.Router();

router.all("/", (req, res, next) =>{
    //res.json({message: "return from Edusource router"});
    next();
 });

//Create new edusource
router.post("/", async(req, res) => {
    const {title, resourceURL, promoterId, autors, languaje, discipline, theme, type, link, linktype, description, picture, licence, valorations} = req.body;

    const eduObj = {
        title: title?title:"",
        resourceURL: resourceURL?resourceURL:"",
        promoterId: promoterId?promoterId:"",
        autors: autors?autors:{},
        discipline: discipline?discipline:"other",
        languaje: languaje?languaje:"EN-en",
        theme: theme?theme:{"label":"other"},
        type: type?type:"lesson",
        link: link,
        linktype: linktype?linktype:"webpage",
        description: description?description:"",
        picture: {
            fileName: picture.fileName?picture.fileName:"",
            file: picture.file?picture.file:"",
            uploadTime: picture.uploadTime?Date(picture.uploadTime):Date.now(),
            type: picture.type?picture.type:"link"
        },
        licence: licence?licence:"CC",
        date: Date.now(),
        valorations: valorations?valorations:[] 
    }
 
    try {
        const result = await insertEdusource(eduObj);
        console.log("Insert Edusource Result",result);
        res.json({status: "success", message: "New Edusource created", result});
 
    } catch(err){
        console.log(err)
        let message = "Unable to create Educational Resource at the moment. Pleaset contact administrator"
        res.json({status:"error", message});
    }
 });

 router.get("/bylink", async(req, res)=>{
    const resourceURL = req.query.link
    console.log("BY LINK", resourceURL)
    try {
        const result = await getEdusourceByLink(resourceURL);
        if (result){
            if (result.valorations){
                for (let index = 0; index < result.valorations.length; index++) {
                    const user = await getUserbyId(result.valorations[index].senderId)
                    const newObj = {
                        _id: result.valorations[index]._id,
                        senderAvatar: user.picture.fileName,
                        senderUser: user.username,
                        comment: result.valorations[index].comment,
                        value: result.valorations[index].value,
                        date: Date(result.valorations[index].date),
                        accepted: Boolean(result.valorations[index].accepted),
                    }   
                    result.valorations[index]=newObj
                }
            }
            res.json({status: "success", result});
        }
        else {
            res.json({status: "error", message:"URI doesnt exist"})
        }
    } catch (error) {
        res.json({status:"error", error});
    }
   
 })

 router.get("/bypromoter", async(req, res)=>{
    const promoterId = req.query.promoterId
    console.log("BY PROMOTER", promoterId)
    try {
        const result = await getEdusourceByPromoterId(promoterId);
        if (result){
            res.json({status: "success", result});
        }
        else {
            res.json({status: "error", message:"URI doesnt exist"})
        }
    } catch (error) {
        res.json({status:"error", error});
    }
 })

 router.post("/valoration", async(req, res)=>{
    const {edusourceId, senderId, comment, value} = req.body;
    const valObj = {
        edusourceId: edusourceId,
        senderId: senderId,
        comment: comment,
        value: value,
        date: Date.now(),
        accepted: false
    }
    try {
        const result = await insertEduValoration(valObj);
        console.log("Insert Edusource Valoration",result);
        res.json({status: "success", message: "New Valoration added", result});
 
    } catch(err){
        console.log(err)
        let message = "Unable to create Valoration at the moment. Pleaset contact administrator"
        res.json({status:"error", message});
    }

 })


module.exports = router;