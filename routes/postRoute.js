'use strict'; 
var post = require('../controllers/postController');  
var upload = require('../lib/userUpload');

var multerware = upload.fields([
  { name: 'file', maxCount: 5}
 ])

module.exports = function (app) {
  app.post('/api/post/save_post',multerware, post.savePost);
  app.post('/api/post/like', post.saveLikes);
  app.get('/api/post/', post.getpost);
};