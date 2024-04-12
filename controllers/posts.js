const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post");
const Comment = require ("../models/Comment");
const Like = require ("../models/Likes")
const User = require('../models/User');

module.exports = {
  getProfile: async (req, res) => {
    try {
      const posts = await Post.find({ user: req.user.id });
      res.render("profile.ejs", { posts: posts, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  getOtherUserProfile: async (req, res) => {
    try {
      const userId = req.params.userId;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).send('User not found');
      }
      const posts = await Post.find({ user: userId });
      res.render('nonuserprofile.ejs', { user, posts });
    } catch (err) {
      console.log(err);
      res.status(500).send('Internal Server Error');
    }
  },
  getFeed: async (req, res) => {
    try {
      const posts = await Post.find().sort({ createdAt: "desc" }).lean();
      res.render("feed.ejs", { posts: posts });
    } catch (err) {
      console.log(err);
    }
  },
  getPost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      const comments = await Comment.find({post: req.params.id}).sort({
        createdAt: "desc"}).lean();
      res.render("post.ejs", { post: post, user: req.user, comments: comments });
    } catch (err) {
      console.log(err);
    }
  },
  createPost: async (req, res) => {
    try {
      // Upload image to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);

      await Post.create({
        title: req.body.title,
        image: result.secure_url,
        cloudinaryId: result.public_id,
        caption: req.body.caption,
        likes: 0,
        user: req.user.id,
        createdBy: req.user.userName,
        createdByImage: req.user.image
      });
      console.log("Post has been added!");
      res.redirect("/profile");
    } catch (err) {
      console.log(err);
    }
  },
  likePost: async (req, res) => {
    try {
      const existingLike = await Like.findOne({
        user: req.user.id,
        post: req.params.id,
      });
  
      if (existingLike) {
        await Like.findOneAndRemove({
          user: req.user.id,
          post: req.params.id,
        });
        await Post.findByIdAndUpdate(
          req.params.id,
          {
            $inc: { likes: -1 },
          }
        );
  
        console.log("Like removed");
      } else {
        await Post.findByIdAndUpdate(
          req.params.id,
          {
            $inc: { likes: 1 },
          }
        );

        await Like.create({
          user: req.user.id,
          post: req.params.id,
        });
  
        console.log("Like added");
      }
      return res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      console.log(err);
      return res.redirect(`/post/${req.params.id}`);
    }
  },
  // likePost: async (req, res) => {
  //   try {
  //     await Post.findOneAndUpdate(
  //       { _id: req.params.id },
  //       {
  //         $inc: { likes: 1 },
  //       }
  //     );
  //     console.log("Likes +1");
  //     res.redirect(`/post/${req.params.id}`);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // },
  deletePost: async (req, res) => {
    try {
      // Find post by id
      let post = await Post.findById({ _id: req.params.id });
      // Delete image from cloudinary
      await cloudinary.uploader.destroy(post.cloudinaryId);
      // Delete post from db
      await Post.remove({ _id: req.params.id });
      console.log("Deleted Post");
      res.redirect("/profile");
    } catch (err) {
      res.redirect("/profile");
    }
  },
};
