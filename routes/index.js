const express = require("express");
const router = express.Router();

const {
  ensureAuth,
  ensureGuest,
  forwardAuthenticated,
} = require("../middleware/auth");
const PostModel = require("../models/Post");

router.get("/", forwardAuthenticated, (req, res) => res.render("dashboard"));

router.get("/", ensureGuest, (req, res) => {
  res.render("login", {
    layout: "login",
  });
});

router.get("/dashboard", ensureAuth, async (req, res) => {
  try {
    console.log(`req: ${req}`);
    const posts = await PostModel.find({ userID: req.user.id }).lean();
    res.render("dashboard", {
      layout: "main",
      hostname: req.hostname,
      name: req.user.name,
      rssUrl: "http://" + req.hostname + "/rss/" + req.user._id,
      posts,
    });
  } catch (err) {
    console.error(err);
    // can add custom 500 error page here:  res.render('path')
  }
});

module.exports = router;
