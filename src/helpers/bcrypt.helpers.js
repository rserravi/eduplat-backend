const bcrypt = require('bcrypt');
const saltRounds = 10;
 
const hashPassword = plainPassword => {
   return new Promise(resolve =>{
       resolve(bcrypt.hashSync(plainPassword, saltRounds))
   });
};

const comparePassword = (plainPassword, passFromDb)=>{
    return new Promise((resolve,reject)=>{
        bcrypt.compare(plainPassword, passFromDb, function(err, result){
            if(err) reject (err);
            resolve (result);
        });
    });
 };
 
 
module.exports = {
   hashPassword,
   comparePassword
};