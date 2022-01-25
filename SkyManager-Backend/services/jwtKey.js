const jwt = require("jsonwebtoken")

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   console.log("jwtKey: " + result);
   return result;
}


let jwtKeyObj = {
    jwtKey: makeid(15)
}

module.exports = jwtKeyObj;