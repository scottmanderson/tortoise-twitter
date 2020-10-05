const express = require("express");
const router = express.Router();
const RSS = require("rss");

const PostModel = require("../models/Post");

router.get("/", async (req, res) => {
  const posts = await PostModel.find({
    userID: req.user.id || req.query.u,
  });

  let feed = new RSS({
    title: "Twitter Summaries By Handle",
    description: "Chronological Feed of Twitter Summaries By Handle",
    feed_url: null,
    site_url: null,
    image_url: null,
  });

  for (const post of posts) {
    feed.item({
      title: post.title,
      description: post.description,
      url: `/posts/${post.urlPath}`,
      date: post.effectiveDatetime,
    });
  }

  const xml = feed.xml();
  res.set("Content-Type", "application/rss+xml");
  res.send(xml);
});

module.exports = router;
