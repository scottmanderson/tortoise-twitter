const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Twit = require('twit')

dotenv.config({ path: './.env' });
const connectionString = process.env.MONGO_URI

const UserModel = require('./models/User')

const T = new Twit({
  consumer_key: process.env.TWITTER_CONSUMER_API_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_API_SECRET_KEY,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

