const cheerio = require('cheerio');

const scrapUrl = (url) =>{
    return new Promise(async (resolve, reject)=>{
        //console.log("ESTAMOS EN SCRAPURL", url);
        resObj = {};

        try {
            const $= cheerio.load(url);
            //console.log($)
            $title = $('head title').text()
            $desc = $('meta[name="description"]').attr('content')
            $kwd = $('meta[name="keywords"]').attr('content')
            $ogTitle = $('meta[property="og:title"]').attr('content')
            $ogImage = $('meta[property="og:image"]').attr('content'),
            $ogkeywords = $('meta[property="og:keywords"]').attr('content')
            $images = $('img');
            $description = $('p').text()

            //console.log($description);
    
            if ($title) {
                resObj.title = $title;
            }
    
            if ($desc) {
                resObj.description = $desc;
            } else {
                resObj.description = $description.substring(0,350);
            }
    
            if ($kwd) {
                resObj.keywords = $kwd;
            }
    
            if ($ogImage && $ogImage.length){
                resObj.ogImage = $ogImage;
            }
    
            if ($ogTitle && $ogTitle.length){
                resObj.ogTitle = $ogTitle;
            }
    
            if ($ogkeywords && $ogkeywords.length){
                resObj.ogkeywords = $ogkeywords;
            }
    
            if ($images && $images.length){
                resObj.images = [];
    
                for (var i = 0; i < $images.length; i++) {
                    resObj.images.push($($images[i]).attr('src'));
                }
            }
    
            //send the response
            //console.log(resObj)
            resolve(resObj);
            
        } catch (error) {
            console.error(error)
            reject(error);
            
        }
       
     })
}

const xtractXcharsFromPDFPages = (pdfPages, maxChars) =>{
    return new Promise((resolve, reject) =>{
        try {
            var actualChars = 0;
            var description = "";
            for (let page = 0; page < pdfPages.length; page++) {
                if (actualChars>=maxChars) { break;}
                for (let content = 0; content < pdfPages[page].content.length; content++) {
                    if (actualChars>=maxChars) { break;}
                    
                    description+= pdfPages[page].content[content].str
                    if (pdfPages[page].content[content].str.slice(-1)!==" " && pdfPages[page].content[content].str!==""){
                        description+=" ";
                    }
                    actualChars = description.length;
                }
                
            }
            resolve(description);
        } catch (error) {
            reject(error);
        }
       
    })
}

const scrapPdf = (pdf) => {
    return new Promise(async (resolve, reject)=>{
        //console.log(pdf);
        resObj = {}
        try {
            $title = pdf.meta.info.Subject !== "(anonymous)"? pdf.pages[0].content[0].str:pdf.meta.info.Subject 
            $kwd = pdf.meta.info.Keywords
            $authors = pdf.meta.info.Author!=="(anonymous),"?pdf.meta.info.Author:"" + pdf.meta.info.Creator!=="(unspecified)"?pdf.meta.info.Creator:""
            $description = await xtractXcharsFromPDFPages(pdf.pages, 300);

            if ($title) {
                resObj.title = $title;
            }
    
            if ($description) {
                resObj.description = $description
            } 

            if ($kwd) {
                resObj.keywords = $kwd;
            }

            if ($authors) {
                resObj.authors = $authors;
            }
    
    
    
            //send the response
            //console.log(resObj)
            resolve(resObj);
            
            
        } catch (error) {
            console.log(error);
            reject(error);
        }
    })
}



//returns: {Website, Youtube, Vimeo, PDF ...}
const getResourceType = (url) =>{
    //console.log("In get resource type", url)
    const lowerCaseUrl = url.toLowerCase();
    if (lowerCaseUrl.substr(lowerCaseUrl.length - 3)==="pdf"){
        return ("PDF")
    }
    if (lowerCaseUrl.search("youtube")!==-1 || lowerCaseUrl.search("youtu.be")!==-1){
        return ("Youtube")
    }

    if (lowerCaseUrl.search("vimeo") !== -1){
        return ("Vimeo")
    }

    return ("Website")

}


module.exports = {scrapUrl, getResourceType, scrapPdf}