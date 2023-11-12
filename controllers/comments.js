
const Comment = require ("../models/Comment");
const commentLike = require ("../models/CommentLikes")

module.exports = {
  createComment: async (req, res) => {
    try {
     
      await Comment.create({
        comment: req.body.comment,
        likes: 0,
        post: req.params.id,
        createdById: req.user.id,
        createdBy: req.user.userName
      });
      console.log("Comment has been added!");
      res.redirect("/post/" +req.params.id);
    } catch (err) {
      console.log(err);
    }
  },
  //  likeComment: async (req, res) => {
  //    try {
  //      await Comment.findOneAndUpdate(
  //        { _id: req.params.commentid },
  //        {
  //          $inc: { likes: 1 },
  //        }
  //      );
  //      console.log("Comment Likes +1");
  //      res.redirect("/post/"+req.params.postid);
  //    } catch (err) {
  //      console.log(err);
  //    }
  //  },

   likeComment: async (req, res) => {
    try {
      const existingLike = await commentLike.findOne({
        user: req.user.id,
        comment: req.params.id,
      });
  
      if (existingLike) {
        await commentLike.findOneAndRemove({
          user: req.user.id,
          comment: req.params.id,
        });
        await Comment.findByIdAndUpdate(
          req.params.id,
          {
            $inc: { likes: -1 },
          }
        );
  
        console.log("Like removed");
      } else {
        await Comment.findByIdAndUpdate(
          req.params.id,
          {
            $inc: { likes: 1 },
          }
        );

        await commentLike.create({
          user: req.user.id,
          comment: req.params.id,
        });
  
        console.log("Like added");
      }
      return res.redirect("/post/"+req.params.postid);
    } catch (err) {
      console.log(err);
      return res.redirect("/post/"+req.params.postid);
    }
  },

   deleteComment: async (req, res) => {
     try {
       await Comment.deleteOne({_id: req.params.commentid});
       console.log("Deleted Post");
       res.redirect("/post/"+req.params.postid);
     } catch (err) {
       res.redirect("/post/"+req.params.postid);
       console.log("There was a problem deleting the comment")
     }
   },
};
