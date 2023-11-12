const mongoose = require("mongoose");

const commentLikeSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
    createdAt: { type: Date, default: Date.now },
  });

module.exports = mongoose.model('commentLike', commentLikeSchema);
