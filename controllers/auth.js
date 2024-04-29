const passport = require("passport");
const validator = require("validator");
const User = require("../models/User");
const cloudinary = require("../middleware/cloudinary");
const Post = require('../models/Post');


exports.getLogin = (req, res) => {
  if (req.user) {
    return res.redirect("/profile");
  }
  res.render("login", {
    title: "Login",
  });
};

exports.postLogin = (req, res, next) => {
  const validationErrors = [];
  if (!validator.isEmail(req.body.email))
    validationErrors.push({ msg: "Please enter a valid email address." });
  if (validator.isEmpty(req.body.password))
    validationErrors.push({ msg: "Password cannot be blank." });

  if (validationErrors.length) {
    req.flash("errors", validationErrors);
    return res.redirect("/login");
  }
  req.body.email = validator.normalizeEmail(req.body.email, {
    gmail_remove_dots: false,
  });

  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash("errors", info);
      return res.redirect("/login");
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", { msg: "Success! You are logged in." });
      res.redirect(req.session.returnTo || "/profile");
    });
  })(req, res, next);
};

exports.logout = (req, res) => {
  req.logout(() => {
    console.log('User has logged out.')
  })
  req.session.destroy((err) => {
    if (err)
      console.log("Error : Failed to destroy the session during logout.", err);
    req.user = null;
    res.redirect("/");
  });
};

exports.getSignup = (req, res) => {
  if (req.user) {
    return res.redirect("/profile");
  }
  res.render("signup", {
    title: "Create Account",
  });
};
exports.profPic = async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    const user = await User.findById(req.params.id);

    if (user.image) {
      await User.findOneAndUpdate(
        { _id: req.params.id },
        {
          image: result.secure_url,
          cloudinaryId: result.public_id,
        }
      );
      
    } else {
      await User.findOneAndUpdate(
        { _id: req.params.id },
        {
          $set: {
            image: result.secure_url,
            cloudinaryId: result.public_id,
          },
        }
      );
    }
    await Post.updateMany({ user: req.params.id }, { createdByImage: result.secure_url });
    console.log("Profile pic has been updated");
    res.redirect(`/profile`);
  } catch (err) {
    console.log(err);
  }
};
exports.postSignup = async (req, res, next) => {
  try {
    const validationErrors = [];
    if (!validator.isEmail(req.body.email))
      validationErrors.push({ msg: "Please enter a valid email address." });
    if (!validator.isLength(req.body.password, { min: 8 }))
      validationErrors.push({
        msg: "Password must be at least 8 characters long",
      });
    if (req.body.password !== req.body.confirmPassword)
      validationErrors.push({ msg: "Passwords do not match" });

    if (validationErrors.length) {
      req.flash("errors", validationErrors);
      return res.redirect("../signup");
    }

    // Normalize email
    req.body.email = validator.normalizeEmail(req.body.email, {
      gmail_remove_dots: false,
    });

    const result = await cloudinary.uploader.upload(req.file.path);
    // Create a new user with profile image
    const user = new User({
      userName: req.body.userName,
      email: req.body.email,
      image: result.secure_url,
      cloudinaryId: result.public_id,
      password: req.body.password,
    });

    // Check if a user with the same email or username already exists
    User.findOne(
      { $or: [{ email: req.body.email }, { userName: req.body.userName }] },
      (err, existingUser) => {
        if (err) {
          return next(err);
        }
        if (existingUser) {
          req.flash("errors", {
            msg: "An account with that email address or username already exists.",
          });
          return res.redirect("../signup");
        }

        // Save the user to the database
        user.save((err) => {
          if (err) {
            return next(err);
          }
          req.logIn(user, (err) => {
            if (err) {
              return next(err);
            }
            res.redirect("/profile");
          });
        });
      }
    );

  
  } catch (error) {
    // Handle any errors, such as validation or image upload issues
    console.error("Error:", error);
    req.flash("errors", [{ msg: "An error occurred while processing your request." }]);
    res.redirect("../signup");
  }
};

