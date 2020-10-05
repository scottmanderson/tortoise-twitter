const mongoose = require("mongoose");

const tweetSchema = new mongoose.Schema({
  twitter_id: Number,
  created_at: Date,
  name: String,
  screen_name: String,
  text: String,
});

module.exports = mongoose.model("Tweet", tweetSchema);
