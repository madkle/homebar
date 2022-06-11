const crypto = require("crypto");
const signatureKey  = "kongOlavDenHellige";

let utils = {};

utils.decodeCred = function(credstring){
    let cred = {}
    let b64String = credstring.replace("basic ","");
    let asciiString = Buffer.from(b64String, "base64").toString("ascii");
    cred.username = asciiString.replace(/:.*/,"");
    cred.password = asciiString.replace(cred.username + ":", "")
    return cred; 
}

utils.createHash = function(password){
    let hash = {};

    hash.salt = Math.random().toString();
    hash.value = crypto.scryptSync(password, hash.salt, 64).toString("hex");

    return hash;
}

utils.createToken = function(username, userID){
    let part1 = JSON.stringify({"alg": "HS256", "typ":"JWT"});
    let part2 = JSON.stringify({"user":username, "userid":userID, "iat":Date.now()});

    let b64Part1 = Buffer.from(part1).toString("base64");
    let b64Part2 = Buffer.from(part2).toString("base64");

    let openPart = b64Part1 + "." + b64Part2;

    let signature = crypto.createHmac("SHA256", signatureKey).update(openPart).digest("base64");

    return openPart + "." + signature;
}

utils.verifyToken = function(token){
    let tokenArr = token.split(".");
    let openPart = tokenArr[0] + "." + tokenArr[1];
    let signatureToCheck = tokenArr[2];

    let sign = crypto.createHmac("SHA256", signatureKey).update(openPart).digest("base64");

    if (signatureToCheck !== sign) {
        return false
    }

    let payloadTxt = Buffer.from(tokenArr[1],"base64").toString("ascii");
    let payload = JSON.parse(payloadTxt);

    let expirationTime = payload.iat + 24 * 60 * 60 * 1000;
    if (expirationTime < Date.now()) {
        return false
    }
    return payload;
}

utils.verifyPassword = function (pswFromUser, hashFromDB, saltFromDB) {
    hash = crypto.scryptSync(pswFromUser,saltFromDB,64).toString("hex");

    if (hash === hashFromDB) {
        return true;
    }

    return false;
}
module.exports = utils;