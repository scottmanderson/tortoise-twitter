const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: String,
  userID: String,
  handle: String,
  effectiveDatetime: Date,
  includedTweets: Object,
  urlPath: String,
});

module.exports = mongoose.model("Post", postSchema);
