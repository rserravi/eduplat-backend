const express = require("express");
const { verifyRefreshJWT, createAccessJWT } = require("../helpers/jwt.helpers");
const { getUserbyRefreshJWT } = require("../model/user/user.model");


const router = express.Router();

router.all("/", (req, res, next) => {
   //res.json({message: "return form tokens router"});
   res.header('Access-Control-Allow-Origin', '*');
   next();
});

// RETURN REFRESH JWT
router.get("/", async (req, res, next) => {
   const { authorization } = req.headers;
   //1. Make sure the token is valid
   const decoded = await verifyRefreshJWT(authorization);
   console.log("DECODED EN REFRESH JWT", decoded, decoded.payload)
   if (decoded) {
      //2. Check if the jwt exists in database (mongo)
      const userProfile = await getUserbyRefreshJWT(authorization);


      if (userProfile._id) {
         const dbRefreshToken = userProfile.refreshJWT.token;

         let tokenExp = userProfile.refreshJWT.addedAt;
         tokenExp = tokenExp.setDate(tokenExp.getDate() + +process.env.JWT_REFRESH_SECRET_EXP_DAY);
         const today = new Date();
         if (dbRefreshToken !== authorization && tokenExp < today){
             return res.status(403).json({message: "Forbidden"});
         }

         const accessJWT = await createAccessJWT(decoded.payload, userProfile._id.toString());
         return res.json({status: "success", accessJWT});
     }
 }
 res.status(403).json({message: "Forbidden"});


});



module.exports = router;