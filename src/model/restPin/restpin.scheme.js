const mongoose = require("mongoose")
const Schema = mongoose.Schema;
 
const ResetPinScheme = new Schema({
 
   pin: {
       type: String,
       minLength: 6,
       maxLenght: 6
   },
   email: {
       type: String,
       maxLenght: 50,
       required: true
   },
   addedAt: {
       type: Date,
       required: true,
       default: Date.now()
   }

});
 
module.exports ={
   ResetPinScheme
}
