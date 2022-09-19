'use strict';
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync')
const post = require('../models/post');
var generalConfig = require('../config/generalConfig');
const jwt_decode = require('jwt-decode');
var path = require('path');
var passport = require("../config/passport.js")();

exports.savePost = catchAsync(async (req, res, next) => {
    var { file } = req.files;
    if (file) {
        var pro_image = file.map(value => value.filename);
    }
    const postcreate = await post.create({
        file: pro_image[0]
    }).then(function (postcreate) {
        res.json({ message: 'Post create sucessfully', error: false, data: postcreate });
    })
        .catch(function (err) {
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
            post.updateOne(
                { _id: req.body.postId },
                { $inc: { likes: 1 } 
            }).then(async result => {
                let user = await post.findOne({ _id: req.body.postId })
                var likes = user.likes
                res.json({ message: 'Post liked successfully', error: false,likes })
            }).catch(err => {
                return res.status(422).json({ error: err })
            })
        }
    })
});

exports.getpost = catchAsync(async (req, res, next) => {
    if (req.body.Query == "high_to_low") {
        var query = {likes: -1}
    } else if (req.body.Query == "low_to_high") {
        var query = {likes: 1}
    }  else if (req.body.Query == "latest") {
        var query = {created_at: -1}
    }
    post.find().sort(query).then(result => {
        if (result == null) {
            res.json({ message: 'Post does not exist', error: true })
        } else {
            result.map((val) => { val.file = `${process.env.IMAGE_FILE}/${val.file}` });
            res.json({ message: 'Post', data: result })
        }
    })
})