
const Comment = require ("../models/Comment");

module.exports = {
  createComment: async (req, res) => {
    try {
     
      await Comment.create({
        comment: req.body.comment,
        likes: 0,
        post: req.params.id,
        user: req.user.id,
      });
      console.log("Comment has been added!");
      res.redirect("/post/" +req.params.id);
    } catch (err) {
      console.log(err);
    }
  },
   likeComment: async (req, res) => {
     try {
       await Comment.findOneAndUpdate(
         { _id: req.params.id },
         {
           $inc: { likes: 1 },
         }
       );
       console.log("Comment Likes +1");
       res.redirect(`/post/${comments.post}`);
     } catch (err) {
       console.log(err);
     }
   },
   deleteComment: async (req, res) => {
     try {
       let comment = await comment.findById({ _id: req.params.id });
       await Comment.remove({ _id: req.params.id });
       console.log("Deleted Post");
       res.redirect("/post/" +comment.post);
     } catch (err) {
       res.redirect("/post/" +comment.post);
     }
   },
};