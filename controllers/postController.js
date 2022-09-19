'use strict';
const catchAsync = require('../utils/catchAsync')
const post = require('../models/post');

exports.savePost = catchAsync(async (req, res, next) => {
    var { file } = req.files;
    if (file) {
        var pro_image = file.map(value => value.filename);
    }
    post.create({file: pro_image[0]}).then(function (postcreate) {
        res.json({ message: 'Post create sucessfully', error: false, data: postcreate });
    }).catch(function (err) {
        if (err.name == 'ValidationError') {
            res.status(404).json(err);
        } else {
            res.status(500).json(err);
        }
    });

});

exports.saveLikes = catchAsync(async (req, res, next) => {
    post.findOne({ _id: req.body.postId }).then(result => {
        if (result == null) {
            res.json({ message: 'Post does not exist', error: true })
        } else {
            post.updateOne({ _id: req.body.postId },{$inc: { likes: 1 }}).then(async result => {
                    let user = await post.findOne({ _id: req.body.postId })
                    var likes = user.likes
                    res.json({ message: 'Post liked successfully', error: false, likes })
                }).catch(err => {
                    return res.status(422).json({ error: err })
                })
        }
    })
});

exports.findAllPost = catchAsync(async (req, res, next) => {
    let dataRequested = req.body;
    let params = req.body.option;
    let query = "";
    if (params.sort != undefined) {
        let attr = params.sort;
        if (Object.keys(attr)[0] == 'likes') {
            query = { likes: attr["likes"] == "asc" ? 1 : -1 }
        } else if (Object.keys(attr)[0] == "created_at") {
            query = { created_at: attr["created_at"] == "asc" ? 1 : -1 }
        }
    }
    let perPage = params.sort.size;
    post.find(dataRequested.query).skip(perPage * (req.params.page - 1)).limit(perPage).sort(query).then(result => {
        if (!result.length) res.json({ message: 'Post does not exist', error: true })
        result.map((val) => { val.file = `${process.env.IMAGE_FILE}/${val.file}` });
        res.json({ message: 'Post Found', data: result });
    })
})