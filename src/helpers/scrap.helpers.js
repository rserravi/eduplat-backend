const cheerio = require('cheerio');
//const { createCanvas, loadImage } = require('canvas');

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
    console.log("In get resource type", url)
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
    if (lowerCaseUrl.search("kahoot")!== -1){
        return ("Kahoot")
    }

    if (lowerCaseUrl.search("docs.google") !== -1){
        return ("Google Docs")
    }

    if (lowerCaseUrl.search("drive.google") !== -1){
        return ("Google Drive")
    }

    if (lowerCaseUrl.search("wordwall") !== -1){
        return ("Wordwall")
    }

    return ("Website")

}

const cleanGoogleDocsUrl = (url)=>{
    // Use regular expression to extract the document ID
    const regex = /\/d\/(.+?)\//;
    const match = url.match(regex);
    var cleanUrl = url;

    if (match) {
        const docId = match[1];
        const baseUrl = "https://docs.google.com/document/d/";
        cleanUrl = baseUrl + docId;
        console.log(cleanUrl);
    }
    return cleanUrl;
}


const cleanKahootUrl = (url)=>{
    const urlParts = url.split("/");
    const kahootID = urlParts[urlParts.length - 1]; 
    const cleanUrl= "https://play.kahoot.it/rest/kahoots/"+kahootID
    
    return cleanUrl;

}

const languageCleanerInKahoot = (language) =>{
    const lowerCaseUrl = language.toLowerCase();

    if (lowerCaseUrl.search("portu") !== -1){
        return ("PT")
    }
    if (lowerCaseUrl.search("espa") !== -1 || lowerCaseUrl.search("spani") !== -1){
        return ("ES")
    }
    if (lowerCaseUrl.search("ngl") !== -1) {
        return ("EN")
    }
    if (lowerCaseUrl.search("ital") !== -1) {
        return ("IT")
    }
    if (lowerCaseUrl.search("cat") !== -1) {
        return ("CA")
    }
    if (lowerCaseUrl.search("fren") !== -1 || lowerCaseUrl.search("fran") !== -1) {
        return ("FR")
    }

    return ("OTHER")
}

/* const CreateImagesFromTitle = async (title) => {
    const canvas = createCanvas(400, 200);
    const ctx = canvas.getContext('2d');
  
    // Set background color
    ctx.fillStyle = '#f2f2f2';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    // Load font
    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = '#333';
  
    // Draw title text on image
    
    const x = canvas.width / 2 - ctx.measureText(title).width / 2;
    const y = canvas.height / 2 + 10;
    ctx.fillText(title, x, y);
  
    // Encode canvas to base64 and return it as data URL
    const dataUrl = canvas.toDataURL();
  
    return dataUrl;
  };
   */
module.exports = {
    scrapUrl, 
    getResourceType, 
    scrapPdf, 
    cleanGoogleDocsUrl, 
    cleanKahootUrl,
    languageCleanerInKahoot,
}