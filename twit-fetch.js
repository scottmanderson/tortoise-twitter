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

// TODO Should probably move this logic pre-DB write
function convertPreferredTimeToLastDatetime(time) {
  const prefHour = Number(time.slice(0, time.indexOf(":")));
  const prefMinute = Number(time.slice(time.indexOf(":") + 1));
  const now = new Date();
  let fixedEnd = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      prefHour,
      prefMinute
    )
  );
  if (fixedEnd > now) {
    fixedEnd.setUTCDate(fixedEnd.getUTCDate() - 1);
  }
  return fixedEnd;
}

async function updateTweetsForUser(userName) {
  let user = await UserModel.findOne({ name: userName });
  let trackedHandles = user.trackedHandles;
  let tweetCollection = {};

  async function fetchTweetsByTwitterHandle(handle) {
    try {
      let options = {
        screen_name: handle,
        tweet_mode: "extended",
      };
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
          url:
            "https://www.twitter.com/" +
            tweet.user.screen_name +
            "/status/" +
            tweet.id,
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
    let begin = new Date(end);
    begin.setHours(end.getHours() - lookbackPeriodHours);

    async function postBuilder(tweets, handle) {
      let newPost = new PostModel({
        title: `Tweets from @${handle} in ${lookbackPeriodHours} hours ending ${end.toLocaleString(
          "en-US"
        )}`,
        userID: user.id,
        handle: handle,
        publishedAt: new Date(),
        effectiveDatetime: end,
        includedTweets: tweets || [],
      });
      const duplicateQuery = await PostModel.findOne({
        title: newPost.title,
      });
      if (
        duplicateQuery === null &&
        newPost.includedTweets &&
        newPost.includedTweets.length
      ) {
        newPost.save((err, post) => {
          if (err) return console.error(err);
        });
      }
    }

    for (const handle of user.trackedHandles) {
      let tweets = await TweetModel.find({
        screen_name: handle,
        created_at: { $gte: begin },
      });
      await postBuilder(tweets, handle);
    }
  }

  for (let handle of trackedHandles) {
    await fetchTweetsByTwitterHandle(handle);
  }
  await pushTweetsToMongo(tweetCollection);
  await generateNewPostsForPeriod(
    convertPreferredTimeToLastDatetime(user.preferredTimeUTC)
  );
}

module.exports = updateTweetsForUser;
