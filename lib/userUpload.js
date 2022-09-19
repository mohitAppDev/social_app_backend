
var path = require('path');
const multer = require('multer')

/* 
  Upload multiple Images into professionalDetails
*/

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        var x = (file);
        console.log(x)
        cb(null, 'uploads/user_profile/')
    },
    filename: function (req, file, cb) {
        var x = (file);
        console.log(x)
        let ext = path.extname(file.originalname)
        cb(null, Date.now() + ext)
    }
})

var upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg" || file.mimetype == "image/gif" ||file.mimetype == "video/mp4" || file.mimetype == "video/webm" || file.mimetype == "video/ogg") {
            callback(null, true)
        }
        else {
            console.log("Only jpeg , png and mp4 extension allowed !")
            callback(null, false)
        }
    },
    limits: {
        fileSize: 1024 * 1024 * 5
    }
})

module.exports = upload;