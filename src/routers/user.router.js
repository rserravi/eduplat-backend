const express = require("express");

const { insertUser, getUserbyEmail, getUserbyId, updatePassword, storeUserRefreshJWT, verifyUser, updateUser, checkUser, getUserbyUserName, searchUsers, insertUserValoration, updateUserValoration, checkEmail } = require("../model/user/user.model");
const { hashPassword, comparePassword} = require("../helpers/bcrypt.helpers")
const { createAccessJWT, createRefreshJWT, decodeGoogleJWT}= require("../helpers/jwt.helpers")
const { userAuthorization} = require("../middleware/authorization.middleware");
const { setPasswordResetPin, getPinbyEmailPin, deletePin } = require("../model/restPin/restpin.model");
const { emailProcessor } = require("../helpers/email.helpers");
const { resetPassReqValidation, newUserValidation } = require("../middleware/formValidation.middleware");
const { deleteJWT } = require("../helpers/redis.helpers");
const { randomCrypto } = require("../helpers/crypto.helpers");
const { decode } = require("jsonwebtoken");
const { addKarma } = require("../utils/karmaHandler");



const router = express.Router();


router.all("/", (req, res, next) =>{
   //res.json({message: "return form user router"});
   next();
});

//Get user profile router
router.get("/", userAuthorization, async (req,res)=>{
    console.log ("USER GET '/'")
    const _id = req.userId; // Comes from middleware userAuthorization
    //console.log("GETTING USER PROFILE OF", _id);
    if (_id){
     
     let userProf = await getUserbyId(_id);
     //console.log("USER PROFILE OF", _id, "FOUND", userProf)
    //userProf.isCompleted = profileCompletness(userProf);
     
     res.json ({user: userProf});
    }
    return ({status: "error", message: "no ID indicated"})
 
 
  })


//Create new User
router.post("/", newUserValidation, async(req, res) => {
   const {username, firstname, lastname, email, password } = req.body;

   try {
            
       //hash password
      const hashedPass = await hashPassword(password);
      const verificationURL = process.env.VERIFICATION_URL;
      const randomUrl = randomCrypto()
      const verificationLink = verificationURL + "/" + randomUrl + "/" + email

      const newUserObj = {
            username,
            firstname,
            lastname,
            password:hashedPass,
            picture:{
                fileName: "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png",
                type: "link"
            },
            isVerified: false,
            emails: [{emailUrl: email, emailDescription:"Home"}],
            phones: [{phoneNumber: "", phoneDescription:"Home"}],
            social: [{media: "Facebook", user:"@"}],
            address: {streetaddress: "",
                    city: "",
                    state: "",
                    postalCode: "",
                    country: ""},
            randomURL: randomUrl,          
      }

       const result = await insertUser(newUserObj);
       //("Insert User Result",result);
       //Send confirmation email
       //await emailProcessor(email, "", "new user confirmation",verificationLink);
       res.json({status: "success", message: "New user created. Check your email for a verification link", result});

   } catch(err){
       console.log(err)
       let message = "Unable to create new user at the moment. Pleaset contact administrator"
       if (err.message.includes("duplicate key")){
           message = "This email already has an account"
       }

       res.json({status:"error", message});
   }
});

router.patch("/", async(req, res)=>{
    try {  
        const _id = req.body._id;
        
        ("IN USER PATCH, updating", req.body)
        if (_id){
            await updateUser(_id, req.body)
                .then((data)=>
                {
                    //console.log("Result of UpdateUser return in Patch userRouter", data)
                    return res.json({status: "success", message:"User Updated"});
                })
                .catch((error)=>{
                    return res.json({status:"error", error});
                })
        }        
    } catch (err) {
        console.log(err)
        return res.json({status:"error", err});
        
    }
 })

 //User sign in Router
router.post("/login", async (req,res) =>{

    const {email, password} = req.body;
    console.log("EN LOGIN", email, password)
    if (!email || !password){
        res.json({status: "error", message:"invalid form submission"});
  
    }

    //get user with email from db
    try {
        const user = await getUserbyEmail(email);
        //console.log("LOGIN POST: GET USER BY EMAIL: ", user);
        const passFromDb = user && user.id ? user.password : null;
       
        if(!passFromDb)
            return res.json({status: "error", message: "Invalid email or password"
        });
      
        const result = await comparePassword(password, passFromDb);
        //console.log("COMPARE PASSWORD", result);
       
        if (!result) {
            return res.json({status: "error", message: "Incorrect Password"});
        }
        const accessJWT = await createAccessJWT(user.email, `${user._id}`)
        //console.log("CREANDO ACCESSJWT DESDE LOGIN", accessJWT)
        const refreshJWT = await createRefreshJWT(user.email, `${user._id}`);
        await addKarma(user._id, process.env.KARMA_FOR_LOGIN)

        return res.json({
            status:"success",
            message: "Login Successful",
            accessJWT,
            refreshJWT,
        });
  
    } catch (error) {
        console.log(error);
    } 
 });

//Router register para google

router.post("/google-registration", async (req, res)=>{
    try {
        const decoded = await decodeGoogleJWT(req.body.credential);
        if (decoded.iss !=""){
            const newUserObj = {
                username: decoded.email.substring(0, decoded.email.indexOf("@")),
                firstname: decoded.given_name,
                lastname: decoded.family_name,
                picture: {
                    fileName: decoded.picture, 
                    uploadTime: decoded.iat,
                    type: "link"
                },
                signInOrigin: "Google",
                isVerified: decoded.email_verified,
                emails: [{emailUrl: decoded.email, emailDescription:"Home"}],
                phones: [{phoneNumber: "", phoneDescription:"Home"}],
                social: [{media: "Facebook", user:"@"}],
                address: {streetaddress: "",
                        city: "",
                        state: "",
                        postalCode: "",
                        country: ""},
                
            }
            const result = await insertUser(newUserObj);
            console.log("Insert User Result",result);
            res.json({status: "success", message: "New user created from Google Accounts", result});
        }
        


    } catch (err) {
       //console.log("Se ha producido un error en GOOGLE-REGISTRATION", err);
       let message = "Unable to create new user at the moment. Pleaset contact administrator"
       if (err.message.includes("duplicate key")){
           message = "This email already has an account"
       }

       res.json({status:"error", message});
    }   
    
})

router.post("/google-login", async (req, res)=>{
    try {
        await decodeGoogleJWT(req.body.credential).then(async decoded =>{
            await getUserbyEmail(decoded.email).then (async user => {
                const accessJWT = await createAccessJWT(user.email, `${user._id}`)
                //console.log("CREANDO ACCESSJWT DESDE LOGIN", accessJWT)
                const refreshJWT = await createRefreshJWT(user.email, `${user._id}`);
                await addKarma(user._id, process.env.KARMA_FOR_LOGIN)
                return res.json({
                    status:"success",
                    message: "Login Successful",
                    accessJWT,
                    refreshJWT,
                });
            }).catch(error => {res.json({status:"error", message:error.message})})
        }).catch(error => {res.json({status:"error", message:error.message})})
       

    } catch (err) {
       //console.log("Se ha producido un error en GOOGLE-REGISTRATION", err);
       let message = "Unable to create new user at the moment. Pleaset contact administrator"
       if (err.message.includes("duplicate key")){
           message = "This email already has an account"
       }

       res.json({status:"error", message});
    }   
})

//Reset password
router.post("/reset-password", resetPassReqValidation, async (req, res)=>{

    //A - Create and send password reset pin number
    //1- receive email
    const {email} = req.body;
  
    //2- check user exists for the email
    try {
        const user = await getUserbyEmail(email);
    
        if (user && user._id){
            //3- create unique 6 digit pin
            //4- save pin and email in database        
        const setPin = await setPasswordResetPin(email);
        const recoveryUrl =  process.env.RECOVERY_URL +  "/" + setPin.pin + "/" + email
            //5 - email the pìn
        const result = await emailProcessor(email, setPin.pin, "request new password", recoveryUrl);
    
        if (result && result.messageId){
            return res.json({status: "success", message:"If the email exists in our database, the password reset pin will be send shortly"});
        }
        return res.json({status: "success", message:"Email found. A recovery PIN is being sent to you. Check your email and follow instructions",setPin});
        }
            
    } catch (error) {
        res.json({status: "error", message:"Unable to process your request at the moment - Try again later. If the email exists in our databes, the password reset pin will be send shortly"});
    }
    
   
    
  
 });


//Update password in DB
router.patch("/reset-password", async (req, res)=>{
    // 1- receive email, pin and new password
    const {email, pin, newPassword} = req.body;
    // 2- validate pin
    const getPin = await getPinbyEmailPin(email,pin);
    if (getPin._id){
        const dbDate = getPin.addedAt;
        const expiresIn = 1
        let expDate = dbDate.setDate(dbDate.getDate() + expiresIn);
        const today = new Date();
        if (today > expDate){
            return res.json({status: "error", message: "Invalid or expired pin"});
        }
  
        //3- encrypt new password
        const hashedPass = await hashPassword(newPassword);
        console.log( newPassword, + " "+ hashedPass);
        //4- update password in DB
        const user = await updatePassword(email,hashedPass);
        if (user._id) {
            // 5- send email notification
            const result = await emailProcessor(email, "", "password update success");
             if (result && result.messageId){
                res.json({status: "success", message:"Confirmation email sent. Check your inbox"});
             }
             //6- delete pins from database
           deletePin(email,pin);
           return res.json({status: "success", message:"Your password has been updated. You can log-in now"})
        }
    }  
    res.json({status: "error", message:"Unable to update your password. Please, try again later."});
 });

//Log out and clear tokens
router.delete("/logout", userAuthorization, async(req,res)=>{
    //1 - get jwt and verify // DONE by Middleware
  
    const {authorization} = req.headers;
    const _id = req.userId;
    //2 - delete accessJWT form redis database
    deleteJWT({authorization});
    //3 - delete refreshJWT from mongodb
    const result = await storeUserRefreshJWT(_id, "");
    if (result._id){
        return res.json({status:"success", message:"Logged out"});
    }
    res.json({status:"error", message:"Unable to log you out. Try again later"});
  
 })

//Verify user after signup
router.patch("/verify", async(req,res)=>{
    try {
        randomURL = req.body.randomUrl;
        email = req.body.email;
        //update user database
        const result =  await verifyUser(randomURL,email);
        if (!result){
            return res.json({status: "error", message: "Invalid request"})
        }
        if(result._id) {
            return res.json({status: "success", message: "Your account has been activated. You may sing in now"})
        }
        return res.json({status: "error", message: "Invalid request"})
    } catch (error) {
        console.log(error)
        return res.json({status: "error", message: error.message})
  
    }
  })

router.get("/checkUser", async(req, res)=>{
    if (req.query.username === "" || req.query.username ===null || req.query.username ===undefined){
        // IS EMAIL CHECK
        try {
            //console.log(req.query.email);
            const email = await checkEmail(req.query.email);
            console.log("Email en check",email)
            if (email && email.status!=="error"){
                //console.log("EMAIL ", req.query.email, " exists")
                return res.json({status: "success", message: "exists"})
            }
            res.json({status:"error", message:"User don't exists"});
            //console.log("EMAIL ", req.query.email, " dont exists")
        } catch (error) {
            console.log(error);
            return res.json({status: "error", message:"User don't exists"})
        }
    }
    else{
        // IS USERNAME CHECK
        try {
            //(req.query.username);
            const user = await checkUser(req.query.username);
            //console.log("User en check",user)
            if (user && user.status!=="error"){
                //console.log("USER ", req.query.username, " exists")
                return res.json({status: "success", message: "exists"})
            }
            res.json({status:"error", message:"User don't exists"});
            //console.log("USER ", req.query.username, " dont exists")
        } catch (error) {
            console.log("USER ", req.query.username, " dont exists")
            return res.json({status: "error", message:"User don't exists"})
        }
    }
})



//Get user by Id

router.get("/fetchUser", async(req, res)=>{
    const userId = req.query.userId
    //console.log("BY ID", req.query)
    try {
        const result = await getUserbyId(userId);
        if (result){
            //console.log(result)
            const userToReturn = {
                "username" : result.username,
                "firstname": result.firstname,
                "lastname" : result.lastname,
                "picture": result.picture,
                "publicData": result.publicData,
                "emails": result.emails,
                "phones": result.phones,
                "social": result.social,
                "editingLevel": result.editingLevel,
                "karma": result.karma,
                "tagline": result.tagline,
                "valorations": result.valorations
            }
            res.json ({user: userToReturn});
        }
        else {
            res.json({status: "error", message:"USERid doesnt exist"})
        }
    } catch (error) {
        res.json({status:"error", error});
    }   
})

router.get("/fetchuserbyusername", async(req, res)=>{
    const userName = req.query.username
    //console.log("BY UNAME", req.query)
    try {
        const result = await getUserbyUserName(userName);
        if (result){
           // console.log(result)
            res.json ({status:"success", user: result});
        }
        else {
            res.json({status: "error", message:"USERname doesnt exist"})
        }
    } catch (error) {
        res.json({status:"error", error});
    }   
})

router.get("/search", async(req, res)=>{
    const terms = req.query.terms;
    const lang = req.query.lang;
    //console.log(req.query);
    try {
        const result = await searchUsers(terms, lang);
        if (result){
            //console.log(result)
            res.json ({status:"success", result});
        }
        else {
            res.json({status: "success", result, message:"Nothing Found"})
        }
    } catch (error) {
        res.json({status:"error", error});
    }   
})

router.post("/valoration", async(req, res)=>{
    const {userId, senderId, comment, value} = req.body;
    const valObj = {
        userId: userId,
        senderId: senderId,
        comment: comment,
        value: value,
        date: Date.now(),
        accepted: false
    }
    try {
        const result = await insertUserValoration(valObj);
        //console.log("Insert User Valoration",result);
        res.json({status: "success", message: "New Valoration added", result});
 
    } catch(err){
        console.log(err)
        let message = "Unable to create Valoration at the moment. Pleaset contact administrator"
        res.json({status:"error", message});
    }

 })

router.patch("/valoration", async(req, res)=>{
    const {userId, senderId, value, comment } = req.body;

    try {
        const result = await updateUserValoration(userId, senderId, value, comment);
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