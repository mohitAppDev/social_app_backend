const mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');

const PostSchema = new mongoose.Schema({
  user_id: {
    type: Number
  },
  file: {
    type: String,
    required: 'File is required',
  },
  likes: {
    type: Number
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  deleted_at: {
    type: Date,
    default: Date.now
  }
});

autoIncrement.initialize(mongoose.connection);
PostSchema.plugin(autoIncrement.plugin, 'post');
const post = mongoose.model('post', PostSchema);

module.exports = post;