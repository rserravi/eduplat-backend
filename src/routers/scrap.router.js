const express = require("express");
const { scrapUrl, getResourceType, scrapPdf, cleanGoogleDocsUrl, cleanKahootUrl, languageCleanerInKahoot } = require("../helpers/scrap.helpers");
const axios = require("axios");
const router = express.Router();
const PDFExtract = require('pdf.js-extract').PDFExtract;
const {writeFile} = require('fs/promises');
const LanguageDetect = require('languagedetect');

router.all("/", (req, res, next) =>{
   //res.json({message: "return form scrap router"});
   res.header('Access-Control-Allow-Origin', '*');
   next();
});

router.get("/", async (req, res)=>{
    const url = req.query.url;
    const resourceType = getResourceType(url);
    console.log("RESOURCE TYPE",resourceType)
    const lngDetector = new LanguageDetect();
    lngDetector.setLanguageType("iso2");
    switch (resourceType) {
        case "PDF":
            // FROM https://github.com/ffalt/pdf.js-extract
            const pdfExtract = new PDFExtract();
            const options = {}; /* see below */
            await axios({url, method:'GET',responseType: 'stream'}).then(async (response)=>{
                    const pdfContents = response.data
                    await writeFile('file.pdf', pdfContents)

                    pdfExtract.extract('file.pdf', options, async (err, data) => {
                        if (err)  return res.json ({status:"error", err});
                        //console.log(data);
                        await scrapPdf (data).then((result)=>{
                            result.linktype = "PDF"
                            result.language = lngDetector.detect(result.description, 1)[0][0].toUpperCase()
                            return res.json ({status:"success", result});
                        }).catch((error)=>{
                            console.log("ERROR EN SCRAPPDF",error)
                            res.json({status: "error", result, message:"Nothing Found"})
                        })
                       
                      });
                    })
            
        break;
        case "Youtube":
            try {
                await axios.get(url).then(async (response)=>{
                               
                    await scrapUrl(response.data).then((result)=>{
                        //console.log(result)
                        result.linktype = "Youtube"
                        result.language = lngDetector.detect(result.description, 1)[0][0].toUpperCase()
                        res.json ({status:"success", result});
                    }).catch((error)=>{
                        console.log("ERROR EN SCRAPURL",error)
                        res.json({status: "error", result, message:"Nothing Found"})
                    })
                }).catch((error)=>{
                    console.log("ERROR EN AXIOS")
                    res.json({status:"error", error});
                })
               
            } catch (error) {
                console.log("ERROR IN TRY", error)
                res.json({status:"error", error});
            }   
            break;
        case "Google Docs":
            const newUrl = cleanGoogleDocsUrl(url);
            try {
                await axios.get(newUrl).then(async (response)=>{
                                
                    await scrapUrl(response.data).then((result)=>{
                        //console.log(result)
                        result.linktype = "Google Docs"
                        result.link = newUrl
                        try {
                            result.language = lngDetector.detect(result.description, 1)[0][0].toUpperCase()    
                        } catch (error) {
                            result.language = "EN"
                        }
                        
                        res.json ({status:"success", result});
                    }).catch((error)=>{
                        console.log("ERROR EN SCRAPURL",error)
                        res.json({status: "error", result, message:"Nothing Found"})
                    })
                }).catch((error)=>{
                    console.log("ERROR EN AXIOS")
                    res.json({status:"error", error});
                })
                
            } catch (error) {
                console.log("ERROR IN TRY", error)
                res.json({status:"error", error});
            }   
            break;
        case "Kahoot":
            const kurl = cleanKahootUrl(url);
            //console.log("KAHOOT URL", kurl)
            try {
                await axios.get(kurl).then(async (response)=>{
                    //console.log("RESPONSE", response)
                    const kahootResult = {};
                    kahootResult.language = languageCleanerInKahoot(response.data.language)
                    kahootResult.title = response.data.title;   
                    kahootResult.description = response.data.description;
                    kahootResult.linktype = "Kahoot";
                    kahootResult.authors = response.data.creator_username;
                    kahootResult.ogImage = response.data.cover;
                    kahootResult.keywords = [response.data.audience, response.data.quizType]
                    res.json ({status:"success", result: kahootResult});
                    
                }).catch((error)=>{
                    console.log("ERROR EN AXIOS", error)
                    res.json({status:"error", message: error});
                })
                
            } catch (error) {
                console.log("ERROR IN TRY", error)
                res.json({status:"error", message: error.description});
            }   
            break;
        case "Vimeo":
        
        break;

        case "Wordwall":
            try {
                await axios.get(url).then(async (response)=>{
                               
                    await scrapUrl(response.data).then((result)=>{
                        //console.log(result)
                        result.linktype = "Wordwall"
                        result.language = lngDetector.detect(result.description, 1)[0][0].toUpperCase()
                        res.json ({status:"success", result});
                    }).catch((error)=>{
                        console.log("ERROR EN SCRAPURL",error)
                        res.json({status: "error", result, message:"Nothing Found"})
                    })
                }).catch((error)=>{
                    console.log("ERROR EN AXIOS")
                    res.json({status:"error", error});
                })
               
            } catch (error) {
                console.log("ERROR IN TRY", error)
                res.json({status:"error", error});
            }   
            break;
        
    
        default:
            try {
                await axios.get(url).then(async (response)=>{
                               
                    await scrapUrl(response.data).then((result)=>{
                        //console.log(result)
                        result.linktype = "Website"
                        result.language = lngDetector.detect(result.description, 1)[0][0].toUpperCase()
                        res.json ({status:"success", result});
                    }).catch((error)=>{
                        console.log("ERROR EN SCRAPURL",error)
                        res.json({status: "error", result, message:"Nothing Found"})
                    })
                }).catch((error)=>{
                    console.log("ERROR EN AXIOS")
                    res.json({status:"error", error});
                })
               
            } catch (error) {
                console.log("ERROR IN TRY", error)
                res.json({status:"error", error});
            }   
            break;
    }

   
})


module.exports = router;