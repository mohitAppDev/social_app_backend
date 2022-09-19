'use strict'; 
const postController = require('../../../controllers/postController');  
var upload = require('../../../lib/userUpload');

var multerware = upload.fields([
  { name: 'file', maxCount: 5}
]);

module.exports = function (app) {
  app.post('/api/post/save_post',multerware, postController.savePost);
  app.post('/api/post/like', postController.saveLikes);
  app.post('/api/post/', postController.findAllPost);
};