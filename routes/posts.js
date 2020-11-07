const express = require("express");
const router = express.Router();

const {
  ensureAuth,
  ensureGuest,
  forwardAuthenticated,
} = require("../middleware/auth");

const PostModel = require("../models/Post");

router.get("/:id", async (req, res) => {
  try {
    let post = await PostModel.findOne({
      _id: req.params.id,
    });
    post = post.toJSON();
    res.render("./partials/_post", {
      layout: "post",
      post,
    });
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;
