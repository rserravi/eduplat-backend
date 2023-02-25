const {verifyAccessJWT} = require("../helpers/jwt.helpers")
const {getJWT, deleteJWT} = require("../helpers/redis.helpers")

const userAuthorization =  async (req, res, next) => {
    const {authorization} = req.headers;
    console.log ("AUTH",authorization);
    //1. verify is jwt is valid
    const decoded = await verifyAccessJWT(authorization);
    if(decoded){
        //2. check if jwt exist in redis
        const userId = await getJWT(authorization);
        console.log("USERID",userId);
    
        if (!userId){
            return res.status(303).json({message: "forbidden"});
        }
    
        req.userId = userId;
        return next();
    }

    deleteJWT(authorization)
    res.status(403).json({message: "forbidden"});
 }
 
 module.exports = {
    userAuthorization
 }