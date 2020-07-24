const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Twit = require('twit')

dotenv.config({ path: './.env' });

const TweetModel = require('./models/Tweet');
const UserModel = require('./models/User');

const T = new Twit({
  consumer_key: process.env.TWITTER_CONSUMER_API_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_API_SECRET_KEY,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

async function updateTweetsForUser(userName) {
  let user = await UserModel.findOne({ name: userName });
  console.log(`updateTweetsForUser ${user}`)
  let trackedHandles = user.trackedHandles;
  console.log(`trackedHandles ${trackedHandles}`)
  let tweetCollection = {};

  async function fetchTweetsByTwitterHandle(handle) {
    try {
      let options = { screen_name: handle }
      let handlePromise = await T.get('statuses/user_timeline', options).then((result) => {
        tweetCollection[handle] = result.data;
      })
    }
     catch (error) {
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
        const duplicateQuery = await TweetModel.findOne({ 'twitter_id': tweet.id });
        if (duplicateQuery === null) {
          currentTweet.save((err, tweet) => {
            if (err) return console.error(err);
          })
        }
      }
    }
  }

  for (let handle of trackedHandles) {
    console.log(`handle: ${handle}`);
    await fetchTweetsByTwitterHandle(handle);
  }
  console.log(tweetCollection)
  await pushTweetsToMongo(tweetCollection);
}

module.exports = updateTweetsForUser;
