const express = require("express");
const hbs = require("express-handlebars").create();
const router = express.Router();
const RSS = require("rss");

const PostModel = require("../models/Post");

router.get("/:uid", async (req, res) => {
  const posts = await PostModel.find({
    userID: req.params.uid,
  });

  const rssDescriptionTemplate = await hbs.getTemplate(
    "./views/partials/_rssDescription.hbs"
  );

  let feed = new RSS({
    title: "Twitter Summaries By Handle",
    description: "Chronological Feed of Twitter Summaries By Handle",
    feed_url: "http://" + req.hostname + "/rss/" + req.params.uid,
    site_url: "http://" + req.hostname,
    image_url: "http://" + req.hostname + "/images/twitterRSS.png",
  });

  for (const post of posts) {
    feed.item({
      title: post.title,
      description: rssDescriptionTemplate({ post: post.toJSON() }),
      url: `https://${req.hostname}/posts/${post._id}`,
      date: post.effectiveDatetime,
    });
  }

  const xml = feed.xml({ indent: "  " });
  res.type("application/rss+xml");
  res.send(xml);
});

router.get("/", async (req, res) => {
  const posts = await PostModel.find({
    userID: req.user.id,
  });

  const rssDescriptionTemplate = await hbs.getTemplate(
    "./views/partials/_rssDescription.hbs"
  );

  let feed = new RSS({
    title: "Twitter Summaries By Handle",
    description: "Chronological Feed of Twitter Summaries By Handle",
    feed_url: "http://" + req.hostname + "/rss/" + req.user._id,
    site_url: "http://" + req.hostname,
    image_url: null,
  });

  for (const post of posts) {
    feed.item({
      title: post.title,
      description: rssDescriptionTemplate({ post: post.toJSON() }),
      url: `https://${req.hostname}/posts/${post._id}`,
      date: post.effectiveDatetime,
    });
  }

  const xml = feed.xml({ indent: "  " });
  res.type("application/rss+xml");
  res.send(xml);
});

module.exports = router;
