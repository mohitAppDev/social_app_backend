/*Crypto use for Encryption and Decryption of string */
var crypto = require('crypto');
const nodemailer = require('nodemailer');
  
// Difining algorithm
const algorithm = 'aes-256-cbc';
  
// Defining key
const key = crypto.randomBytes(32);
  
// Defining iv
const iv = crypto.randomBytes(16);

var jwt = require('jwt-simple');
var moment = require('moment');
const { profile } = require('console');

var serverUrl = 'http://localhost:9091';
// var serverUrl = 'http://103.93.16.78/api';

var saltKey = 'f186e5f12f16252f9c2db5cvf8807jkc';
var secretKey = 'X2sedo2Bnc';

var jwtSession = { session: false }

var table_prefix = 'dkmart_';

var blankUserImageThumb = serverUrl + '/uploads/admin_profile/thumb100_noimage.png';
var blankUserImage = serverUrl + '/uploads/admin_profile/thumb768_noimage.png';

var paths = {
    userPicture: "uploads/admin_profile/",
    userProfileDoc: "uploads/user_profile/", 
};

var adminUrl = "http://localhost:4200"
// var adminUrl = "http://103.93.16.78"

var validImageExtensions = ['.png', '.jpg', '.jpeg', 'gif'];
var validImageSize = 5000000;

function authenticate(plainText, hashedPassword) {
    return encryptPassword(plainText, saltKey) === hashedPassword;
}

function encryptPassword(password) {
    if (!password) return '';
    return crypto.pbkdf2Sync(password, saltKey, 10000, 64, 'sha1').toString('hex');
}

function encryptOtp(text) {
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('hex');
   }
     
   function decryptOtp(text) {
    let iv_new = iv.toString('hex')
    let ivs = Buffer.from(iv_new, 'hex');
    let encryptedText = Buffer.from(text, 'hex');
    let decipher = crypto.createDecipheriv(
           'aes-256-cbc', Buffer.from(key), ivs);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
   }

function generateJwtToken(id,email,name,username,profile, res) {
    if (id) {
        var expireDate = moment().add(12, 'months').valueOf();
        var payload = {
            id: id,
            email:email,
            username:username,
            name:name,
            profile:profile,
            expDate: expireDate
        };
        res({ newToken: jwt.encode(payload, secretKey) });

    } else {
        res({ newToken: null });
    }
}

function generateAppJwtToken(id, user_type, res) {
    if (id) {
        var expireDate = moment().add(12, 'months').valueOf();
        var payload = {
            id: id,
            user_type: user_type,
            expDate: expireDate
        };
        res({ newToken: jwt.encode(payload, secretKey) });
    } else {
        res({ newToken: null });
    }
}


/**
 * Get userId from token
 */
function getUserId(req) {
    if (req.headers.authorization) {
        var accesstoken = req.headers.authorization.split(" ")[1];
        var obj = jwt.decode(accesstoken, secretKey);
        return obj.id;
    } else {
        return null;
    }
}

module.exports = {
    cryptoAuthentication: {
        crypto: crypto,
        algorithm: 'aes-256-ctr',
        password: 'cnhzeXN0ZW0'
    },
    cryptKey: 'cnhzeXN0ZW0',
    authenticate: authenticate,
    encryptPassword: encryptPassword,
    encryptOtp: encryptOtp,
    decryptOtp: decryptOtp,
    saltKey: saltKey,
    secretKey: secretKey,
    jwtSession: jwtSession,
    getUserId: getUserId,
    table_prefix: table_prefix,
    generateJwtToken: generateJwtToken,
    generateAppJwtToken: generateAppJwtToken,
    serverUrl: serverUrl,
    blankUserImageThumb: blankUserImageThumb,
    blankUserImage: blankUserImage,
    filesPath: paths,
    validImageExtensions: validImageExtensions,
    validImageSize: validImageSize,
    adminUrl:adminUrl, 
};
