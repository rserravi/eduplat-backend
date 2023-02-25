const { string } = require("joi");
const Joi = require("joi");
 
const email= Joi.string()
       .email({ minDomainSegments: 2,
       tlds: { allow: ['com', 'net', 'edu', 'cat', 'es', 'org'] }
               })

const pin= Joi.number().min(100000).max(999999).required();
const newPassword = Joi.string()
       .alphanum()
       .min(3)
       .max(30)
       .required();
            
const shortString = Joi.string()
       .max(30)
       .allow(null)
 
const resetPassReqValidation = (req, res, next) =>{
       const schema = Joi.object({email});
       const value = schema.validate(req.body);
       if(value.error){
               res.json({status: "error", message: value.error.message});
       }
       next();
}

const updatePassValidation = (req, res, next) =>{
       console.log(req.body);
       const schema = Joi.object({email, pin, newPassword});

       const value = schema.validate(req.body);
       if(value.error){
              res.json({status: "error", message: value.error.message});
       }
       next();
}

const newUserValidation = (req, res, next) =>{
       const schema = Joi.object().keys({
              firstname: shortString.required(),
              lastname: shortString.required(),
              email: email,
              password: newPassword,
              submit: shortString
       })
       
       const value = schema.validate(req.body);
       console.log(value);
       if(value.error){
              return res.json({status: "error", message: value.error.message});
       }
       next();
      
}

const newClubValidation = (req, res, next) =>{
       const schema = Joi.object().keys({
              clubname: shortString.required(),
       })
}

 
module.exports = {
       resetPassReqValidation,
       updatePassValidation,
       newUserValidation,
       newClubValidation,
}
