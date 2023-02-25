const randomGenerator = require("../../utils/randomGenerator");
const { ResetPinScheme } = require("./restpin.scheme");


const setPasswordResetPin = (email) =>{
   const randPin = randomGenerator(6);

   const resetObj = {
       email,
       pin : randPin,
   }
   return new Promise(async (resolve,reject) => {

    const dbConnection = await global.clientConnection
    const db = await dbConnection.useDb(mainDataBaseName)
    const Pin =  await db.model('Reset_pin', ResetPinScheme)
    
    Pin(resetObj)
           .save()
           .then((data) => resolve(data))
           .catch((error) => reject(error));
   });
};

const getPinbyEmailPin = (email, pin) =>{
    return new Promise(async (resolve, reject)=>{

        const dbConnection = await global.clientConnection
        const db = await dbConnection.useDb(mainDataBaseName)
        const Pin =  await db.model('Reset_pin', ResetPinScheme)
        
        try {
            Pin.findOne({email, pin}, (error, data)=>{
                if (error){
                    console.log(error);
                    resolve(false);
                }
  
                resolve(data);
            })
       
        } catch (error) {
            reject(error);
            console.log(error);
        }
    });
 }
 
const deletePin = async (email, pin) =>{

    const dbConnection = await global.clientConnection
    const db = await dbConnection.useDb(mainDataBaseName)
    const Pin =  await db.model('Reset_pin', ResetPinScheme)
    
    try {
        Pin.findOneAndDelete({email, pin}, (error, data)=>{
            if (error){
                console.log(error);
            }
        })
   
    } catch (error) {
        console.log(error);
    }
}
 
 
 
module.exports = {
   setPasswordResetPin,
   getPinbyEmailPin,
   deletePin
}
