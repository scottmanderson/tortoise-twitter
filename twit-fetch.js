const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Twit = require("twit");

dotenv.config({ path: "./.env" });

const PostModel = require("./models/Post");
const TweetModel = require("./models/Tweet");
const UserModel = require("./models/User");

const T = new Twit({
  consumer_key: process.env.TWITTER_CONSUMER_API_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_API_SECRET_KEY,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

async function updateTweetsForUser(userName) {
  let user = await UserModel.findOne({ name: userName });
  let trackedHandles = user.trackedHandles;
  let userTimeCutoff = user.preferredTimeGMT;
  let tweetCollection = {};

  async function fetchTweetsByTwitterHandle(handle) {
    try {
      let options = { screen_name: handle };
      let handlePromise = await T.get("statuses/user_timeline", options).then(
        (result) => {
          tweetCollection[handle] = result.data;
        }
      );
    } catch (error) {
      console.error(error);
    }
  }

  async function pushTweetsToMongo(objOfTweetArrays) {
    for (const key in objOfTweetArrays) {
      for (const tweet of objOfTweetArrays[key]) {
        let currentTweet = new TweetModel({
          twitter_id: tweet.id,
          created_at: tweet.created_at,
          name: tweet.user.name,
          screen_name: tweet.user.screen_name,
          full_text: tweet.full_text,
        });
        const duplicateQuery = await TweetModel.findOne({
          twitter_id: tweet.id,
        });
        if (duplicateQuery === null) {
          currentTweet.save((err, tweet) => {
            if (err) return console.error(err);
          });
        }
      }
    }
  }

  async function generateNewPostsForPeriod(end, lookbackPeriodHours) {
    if (!end) {
      end = new Date();
    }
    if (!lookbackPeriodHours) {
      lookbackPeriodHours = 24;
    }
    let begin = new Date(end.setDate(end.getDate() - lookbackPeriodHours / 24));

    function postBuilder(tweets, handle) {
      let newPost = new PostModel({
        title: `Tweets from @ ${handle} in ${lookbackPeriodHours} hours ending ${end.toLocaleString(
          "en-US"
        )}`,
        handle: handle,
        effectiveDatetime: end,
        includedTweets: tweets || "",
      });
      newPost.save((err, post) => {
        if (err) return console.error(err);
      });
    }

    for (const handle of trackedHandles) {
      let tweets = await TweetModel.find(
        { screen_name: handle, created_at: { $gte: begin } },
        (err, tweets) => {
          postBuilder(tweets, handle);
        }
      );
    }
  }

  for (let handle of trackedHandles) {
    await fetchTweetsByTwitterHandle(handle);
  }
  await pushTweetsToMongo(tweetCollection);
}

module.exports = updateTweetsForUser;
