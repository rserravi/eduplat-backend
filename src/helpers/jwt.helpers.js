const jwt = require("jsonwebtoken");
const { setJWT, getJWT } = require("./redis.helpers");
const {storeUserRefreshJWT} = require("../model/user/user.model")
 
const createAccessJWT = async(email, _id) =>{
try {
  const accessJWT = jwt.sign({email},
        process.env.JWT_ACCESS_SECRET,
        {expiresIn:"15m"}
    );
    
    await setJWT(accessJWT, _id).then((data)=>{console.log("DATA RETORNADA DE SETJWT",data)}).catch((err)=>{console.log("ERROR EN DATA DE SETJWT",err)})
    return Promise.resolve(accessJWT);
            
    } catch (error) {
        Promise.reject(error);
    }
};

 
const createRefreshJWT = async (payload, _id) =>{
    try {
      const refreshJWT = jwt.sign({payload},
          process.env.JWT_REFRESH_SECRET,
          {expiresIn: "30d"},
          );
      
       await storeUserRefreshJWT(_id, refreshJWT);
       return Promise.resolve(refreshJWT);
       } catch (error) {
           return Promise.reject(error);
       }
}

const verifyAccessJWT = userJWT => {
    try {
        return Promise.resolve( jwt.verify(userJWT, process.env.JWT_ACCESS_SECRET));
    } catch (error) {
        return Promise.resolve(error)
    }
 }
 
const verifyRefreshJWT = userJWT => {
    try {
        return Promise.resolve( jwt.verify(userJWT, process.env.JWT_REFRESH_SECRET));
    } catch (error) {
        return Promise.reject(error);
    }
 }

 const decodeGoogleJWT = (payload) =>{
    try{
        return Promise.resolve( jwt.decode(payload));
    } catch (error) {
        return Promise.reject (error);
    }
 }
 
   
 
module.exports = {
   createAccessJWT,
   createRefreshJWT,
   verifyAccessJWT,
   verifyRefreshJWT,
   decodeGoogleJWT
}
