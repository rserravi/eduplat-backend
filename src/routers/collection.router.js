const express = require("express");
const { insertCollection, getCollectionById, markAsSeen, checkedMark, getCollectionByUrl, getCollecionValoration, insertCollectionValoration, updateCollectionValoration, getCollection, getCollectionByPromoterId } = require("../model/collection/collection.model");
const router = express.Router();

router.all("/", (req, res, next) =>{
   
   res.header('Access-Control-Allow-Origin', '*');
   //res.json({message: "return form collection router"});
   next();
});


router.post("/", async (req, res)=>{

    const {title, collectionURL, promoterId, description, content, picture, valorations} = req.body;

    
    const collObj = {
        title: title?title:"",
        collectionURL: collectionURL?collectionURL:"",
        promoterId: promoterId?promoterId:"",
        description: description?description:"",
        content :content?content:[],
        picture: {
            fileName: picture.fileName?picture.fileName:"",
            file: picture.file?picture.file:"",
            uploadTime: picture.uploadTime?Date(picture.uploadTime):Date.now(),
            type: picture.type?picture.type:"link"
        },
        date: Date.now(),
        valorations: valorations?valorations:[] 
    }

    

    try {
        const result = await insertCollection(collObj);
        //console.log("Insert Cellection Result",result);
        res.json({status: "success", message: "New Collection created", result});
 
    } catch(err){
        console.log(err)
        let message = "Unable to create Collection at the moment. Pleaset contact administrator"
        res.json({status:"error", message});
    }

})

router.get("/", async (req, res)=>{
    const url = req.query.url
    const id = req.query.id
    const page = req.query.page;
    const terms = req.query.terms;
    if (url && url!==null && url!==undefined){
        await getCollectionByUrl(url, page?page:1).then((result)=>{
            console.log ("GETTING RESULT",result)
            res.json({status:"success", result})
        }).catch((err)=>{
            res.json({status:"error", message: err.message})
        })
        
    }
    else if (id && id!==null && id!==undefined){
        await getCollectionById(id, page?page:1).then((result)=>{
            console.log ("GETTING RESULT",result)
            res.json({status:"success", result})
        }).catch((err)=>{
            res.json({status:"error", message: err.message})
        })
    }

    else if (!id && !url){
       await getCollection(terms,page?page:1).then((result)=>{
            console.log ("GETTING RESULT",result)
            res.json({status:"success", result})
        }).catch((err)=>{
            res.json({status:"error", message: err.message})
        })
    }
})

router.get("/bypromoter", async (req,res)=>{
    const promoterId = req.query.promoterId;
    const page = req.query.page;

    try {
        await getCollectionByPromoterId(promoterId, page).then((result)=>{
            res.json({status: "success", result: result.data, total: result.total})
        }).catch((err)=>{
            res.json({status:"error", message: err.message})
        })
        
    } catch (error) {
        res.json({status:"error", message:error.message});
    }
})

router.post("/mark", async(req,res)=>{
    const {collectionId, contentId, userId} = req.body;
   // console.log(collectionId, contentId, userId);
    try {
        await markAsSeen(collectionId, contentId, userId).then((result)=>{
            //console.log(result);
            res.json(result)
        })
        
    } catch (error) {
        res.json({status:"error", message:error.message});
    }

})

router.get("/mark", async(req,res)=>{
    const {collectionId, contentId, userId} = req.query;
   // console.log(collectionId, contentId, userId);
    try {
        await checkedMark(collectionId, contentId, userId).then((result)=>{
            //console.log(result);
            res.json(result)
        })
        
    } catch (error) {
        res.json({status:"error", message:error.message});
    }

})

router.get("/valoration", async(req, res)=>{
    const {userId, collectionId} = req.query;
    try {
        const result = await getCollecionValoration(userId, collectionId);
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
    const {collectionId, senderId, comment, value} = req.body;
    //console.log(req.body);
    const valObj = {
        collectionId: collectionId,
        senderId: senderId,
        comment: comment,
        value: value,
        date: Date.now(),
        accepted: false
    }
    try {
        const result = await insertCollectionValoration(valObj);
        //console.log("Insert Edusource Valoration",result);
        res.json({status: "success", message: "New Valoration added", result});
 
    } catch(err){
        console.log(err)
        let message = "Unable to create Valoration at the moment. Pleaset contact administrator"
        res.json({status:"error", message});
    }

 })
 
 router.patch("/valoration", async(req, res)=>{
    const {_id, senderId, value, comment, collectionId} = req.body;
    console.log("BODY EN PATCH",req.body);
    try {
        const result = await updateCollectionValoration(_id, senderId, value, comment, collectionId);
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


module.exports = router;