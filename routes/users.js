const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");

const UserModel = require("../models/User");
const { forwardAuthenticated } = require("../middleware/auth");

// Login Page
router.get("/login", forwardAuthenticated, (req, res) => {
  res.render("login", {
    layout: "login",
  });
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

// Register Page
router.get("/register", forwardAuthenticated, (req, res) => {
  res.render("register", {
    layout: "register",
  });
});

router.post("/register", (req, res) => {
  const {
    name,
    email,
    password,
    password2,
    trackedHandlesStr,
    preferredTimeGMT,
  } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2 || !preferredTimeGMT) {
    errors.push({ msg: "All fields are required" });
  }

  if (password2 !== password) {
    errors.push({
      msg: "Password confirmation did not match, please re-enter",
    });
  }

  if (errors.length > 0) {
    res.render("register", {
      errors,
      name,
      email,
      password,
      password2,
    });
  } else {
    UserModel.findOne({ email: email }).then((user) => {
      if (user) {
        errors.push({ msg: "Email previously registered" });
        res.render("register", {
          errors,
          name,
          email,
          password,
          password2,
        });
      } else {
        let trackedHandles = trackedHandlesStr.split(", ");
        const newUser = new UserModel({
          name,
          email,
          password,
          trackedHandles,
          preferredTimeGMT,
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then((user) => {
                /*
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                 */
                res.redirect("/users/login");
              })
              .catch((err) => console.log(err));
          });
        });
      }
    });
  }
});

// Logout
router.get("/logout", (req, res) => {
  req.logout();
  // req.flash('success_msg', 'You are logged out');
  res.redirect("/users/login");
});

module.exports = router;
