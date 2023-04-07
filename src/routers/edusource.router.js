const express = require("express");
const {insertEdusource, getEdusourceByLink, insertEduValoration, getEdusourceByPromoterId, getLastResources, getValoration, updateValoration} = require('../model/edusource/edusource.model');
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
        languaje: languaje?languaje:"EN",
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

 router.post("/valoration", async(req, res)=>{
    const {edusourceId, senderId, comment, value} = req.body;
    console.log(req.body);
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

 router.get("/valoration", async(req, res)=>{
    const {userId, edusourceId} = req.query;
    try {
        const result = await getValoration(userId, edusourceId);
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

 router.patch("/valoration", async(req, res)=>{
    const {senderId, edusourceId, value, comment } = req.body;
    try {
        const result = await updateValoration(senderId, edusourceId, value, comment);
        if (result){
            res.json({status: "success", result});
        }
        else {
            res.json({status: "error", message:"URI doesnt exist"})
        }
     
    } catch (error) {
        console.log(error)
        res.json({status:"error", error});
    }
 })

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

 router.get("/sortedbypromoterid", async(req, res)=>{
    const promoterId = req.query.promoterId
    console.log("SortedByPromoterId", promoterId)
     try {
        const result = await getEdusourceByPromoterId(promoterId);
        if (result){
            var accepted = []
            var noAccepted = []
            //RECORREMOS EDUSOURCES
            for (let edu = 0; edu < result.length; edu++) {
                console.log(result[edu].valorations)
                 if (result[edu].valorations.length>0){

                    for (let index = 0; index < result[edu].valorations.length; index++) {
                        const user = await getUserbyId(result[edu].valorations[index].senderId)
                        const newObj = {
                            val_id: result[edu].valorations[index]._id,
                            senderPicture: user.picture,
                            senderUser: user.username,
                            edu_id: result[edu]._id,
                            eduTitle: result[edu].title,
                            eduDescription: result[edu].description,
                            eduPicture: result[edu].picture,
                            comment: result[edu].valorations[index].comment,
                            value: result[edu].valorations[index].value,
                            date: Date(result[edu].valorations[index].date),
                            accepted: Boolean(result[edu].valorations[index].accepted),
                        }   
                        if (result[edu].valorations[index].accepted)
                            accepted.push(newObj); 
                        else 
                            noAccepted.push(newObj);
                    }
                } 
            }
            

            res.json({status: "success", accepted, noAccepted});
        }
        else {
            res.json({status: "error", message:"URI doesnt exist"})
        }
     } catch (error) {
        console.log(error)
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



 router.get("/last", async(req, res)=>{
    try {
        const result = await getLastResources();
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


module.exports = router;