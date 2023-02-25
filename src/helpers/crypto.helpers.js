
var crypto = require("crypto");
 
const randomCrypto = () => {
   return crypto.randomBytes(20).toString('hex');
}
 
module.exports = {
   randomCrypto
}