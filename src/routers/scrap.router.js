const express = require("express");
const { scrapUrl, getResourceType, scrapPdf } = require("../helpers/scrap.helpers");
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
    //console.log("RESOURCE TYPE",resourceType)
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
        case "Vimeo":
        
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