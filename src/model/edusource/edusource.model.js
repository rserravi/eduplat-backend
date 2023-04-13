const {EdusourceScheme} = require("./edusource.scheme");
const mongoose = require("mongoose");
const { getUserbyId } = require("../user/user.model");
const { UserScheme } = require("../user/user.scheme");
const { addKarma } = require("../../utils/karmaHandler");

const mainDataBaseName = process.env.MAIN_DATABASE_NAME;

const includeAccentsInRegx= terms => {

    var newString = "";
    for (let i = 0; i< terms.length; i++) {
      const character = terms[i].toLowerCase();
      var newChar= character
      if (character==="a" || character ==="à" || character==='á' || character === 'ä'){
        newChar = '[aàáä]'
      }

      if (character==="e" || character ==="è" || character==='é' || character === 'ë'){
        newChar = '[eèéë]'
      }

      if (character==="i" || character ==="ì" || character==='í' || character === 'ï'){
        newChar = '[iìíï]'
      }

      if (character==="o" || character ==="ò" || character==='ó' || character === 'ö'){
        newChar = '[oòóö]'
      }

      if (character==="u" || character ==="ù" || character==='ú' || character === 'ü'){
        newChar = '[uùúü]'
      }

      if (character==="n" || character ==="ñ"){
        newChar = '[nñ]'
      }

      if (character==="c" || character ==="ç"){
        newChar = '[cç]'
      }

      if (character ==="b" || character ==="v"){
        newChar = '[vb]'
      }

      newString+=newChar;
    }

    //console.log(newString)

    return newString;
}

const replaceUnderscoresWithSpaces=(str)=> {
    // replace underscores with spaces using a regular expression
    const result = str.replace(/_/g, ' ');
  
    return result;
  }

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

 const updateResource = edusourceObj => {
    return new Promise(async (resolve, reject)=>{ 
 
        const dbConnection = await global.clientConnection
        const db = await dbConnection.useDb(mainDataBaseName)
        const EduSource = await db.model("edusource",EdusourceScheme)
        try {
            EduSource.findByIdAndUpdate(
                edusourceObj._id,
                edusourceObj, {new: true}, async (error, data)=>{
                        if(error){
                            console.log(error);
                            reject(error);
                        }
                        else{
                            resolve(data);
                        }
                    }
            ).lean().clone();
            
        } catch (error) {
            reject(error)
        }
        
      
    })
 }

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
                async (error, data)=>{
            if(error){
                console.log(error);
                reject(error);
            }
            else{
                await addKarma(valObj.senderId, process.env.KARMA_FOR_EDUSOURCE_VALORATION)
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
                //console.log(data);
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
        const UserSource = await db.model("user", UserScheme)
 
        //console.log("EN GET RESOURCES", promoterId)
        if((!promoterId)) return false;
        try{
            EduSource.find({"promoterId": promoterId}, (error, data)=>{
            if(error){
                console.log(error);
                reject(error);
            }
            else{
                //console.log(data);
                resolve(data);
            }
            }
        ).populate({path:"promoterId", select:'username firstname lastname picture'}).lean().clone().sort({_id: -1 })
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
                //console.log("LAST RESOURCES",data);
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
                //console.log(data); 
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
    //console.log("GET EDUSOURCE BY ID ", edusourceId)
    return new Promise(async (resolve,reject)=>{

        const dbConnection = await global.clientConnection
        const db = await dbConnection.useDb(mainDataBaseName)
        const EduSource = await db.model("edusource",EdusourceScheme)

        if((!edusourceId)) return false;
        try{
            //console.log("TRYING")
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
        //console.log(edusource)
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

 const acceptRejectValoration =(accepted, rejected, edu_id, val_id)=>{
    return new Promise(async (resolve,reject)=>{

        const dbConnection = await global.clientConnection
        const db = await dbConnection.useDb(mainDataBaseName)
        const EduSource = await db.model("edusource",EdusourceScheme)

        if((!edu_id) || !val_id) return false;
        try{
            
            const edu = await EduSource.findById(edu_id);
            
            if (!edu) reject({"status":"error", "message":"No edusource found"})

            var valorations = [... edu.valorations]
            //console.log(valorations)

            for (let val = 0; val < valorations.length; val++) {
                
                if (valorations[val]._id.toString()===val_id){
                    valorations[val].accepted = accepted,
                    valorations[val].rejected = rejected
                    //console.log(valorations[val])
                    
                    edu.valorations = valorations
                    edu.save().then((newData)=>{
                        resolve(newData)
                    }).catch((error)=>{
                        console.log("Error en Update", error);
                        reject(error);
                    })
                }
                
            }            
        
        } catch (error) {
            console.log("NOT FOUND _ID")
            reject(error);
        }
    });
 }

 const deleteEduById = (edusourceId)=>{
    return new Promise(async (resolve,reject)=>{

        const dbConnection = await global.clientConnection
        const db = await dbConnection.useDb(mainDataBaseName)
        const EduSource = await db.model("edusource",EdusourceScheme)

        if((!edusourceId)) return false;
        try{
            //console.log("TRYING")
            EduSource.deleteOne({"_id": edusourceId}, async (error, data)=>{
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
 }

 const searchEdusources = (terms, lang,  category, level, themes) =>{
    return new Promise(async (resolve,reject)=>{

        const dbConnection = await global.clientConnection
        const db = await dbConnection.useDb(mainDataBaseName)
        const EduSource = await db.model("edusource",EdusourceScheme)
        const UserSource = await db.model("user", UserScheme)
       
        var searchString="";

        if((!terms)) return false;
        
        var newTerms = replaceUnderscoresWithSpaces(terms)
        
        newTerms = includeAccentsInRegx(newTerms);
       

        var language = lang;
        if (lang === "ANY" || lang==="any") language="";

        var catArray=""
        if(category){
        catArray = category.split(",");
        }
        var themeArray
        if (themes){ 
        themeArray = themes.split(",");
        }

        var searchTermsArray = newTerms.split(" ");
        searchTermsArray = [... searchTermsArray, newTerms]
        console.log("SEARCH TERMS ARRAY",searchTermsArray);

        var data =[];
        
        for (let index = 0; index < searchTermsArray.length; index++) {
            const regx = {$regex: searchTermsArray[index], $options: 'i'}
            //console.log (regx);
            searchString = {
                language:language?language.toUpperCase():{$regex:'[A-Za-z0-9]', $options:'i'},
                discipline:category?{$in:catArray}:{$regex:'[A-Za-z0-9]', $options:'i'},
                themes: themes?{ $in:themeArray}:{$regex:'[A-Za-z0-9]', $options:'i'},
                $and: [
                {$or: [
                    {title: regx},
                    {discipline: regx},
                    {theme:{ $elemMatch:{regx}}},
                    {autors:{ $elemMatch:{ autorName: regx}}},
                    {description: regx},
                    ]}]
                }
            try{
                await EduSource.find(searchString, async (error, ndata)=>{
                    if(error){
                        console.log(error)
                        reject(error);
                    }
                    else{
                        //console.log("ESTO ES NDATA",ndata)
                        data = [...data, ndata]
                        console.log("ESTO ES DATA1", data);
                       
                    }
                }
                ).populate({path:"promoterId", select:'username firstname lastname picture'}).lean().clone();
            } catch (error) {
                console.log("ERROR EN FIND",error)
                reject(error);
            }
        }
        //console.log("ESTO ES DATA2", data);
        resolve (data[0]);
        
    })
 }

 const searchCategories = (category) =>{
    return new Promise(async (resolve,reject)=>{

        const dbConnection = await global.clientConnection
        const db = await dbConnection.useDb(mainDataBaseName)
        const EduSource = await db.model("edusource",EdusourceScheme)
        const UserSource = await db.model("user", UserScheme)
       
        var searchString="";

        if((!category)) return false;
        
        
        const newTerms = replaceUnderscoresWithSpaces(category);
        //const regx = {$regex: newTerms, $options: 'i'}
        
        var newArr =[]
        catArray = newTerms.split(",");
        
        
        searchString = {
          
            discipline:{$in: catArray}
          
            }
        
        //console.log(searchString);
        try{
            EduSource.find(searchString, async (error, data)=>{
                if(error){
                    console.log(error)
                    reject(error);
                }
                else{
                    resolve(data);
                }
            }
            ).populate({path:"promoterId", select:'username firstname lastname picture'}).lean().clone();
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
    updateValoration,
    deleteEduById,
    updateResource,
    searchEdusources,
    includeAccentsInRegx,
    searchCategories,
    replaceUnderscoresWithSpaces,
    acceptRejectValoration
 }