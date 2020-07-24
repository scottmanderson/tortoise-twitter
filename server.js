const dotenv = require('dotenv');
const express = require('express');
const exphbs = require('express-handlebars')
const flash = require('connect-flash');
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');
const path = require('path');
const session = require('express-session');

const connectDB = require('./config/db');
const updateTweetsForUser = require('./twit-fetch')
const UserModel = require('./models/User')

// Load config from .env
dotenv.config({ path: './.env' });

const mongoStore = require('connect-mongo')(session)
connectDB();

const app = express();

// Body parser
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// Static folder
app.use(express.static(path.join(__dirname, 'public')))

// view engine configuration
// Handlebars Helpers
const {
  formatDate,
  stripTags,
  truncate,
  editIcon,
  select,
} = require('./helpers/hbs')

// Handlebars
app.engine(
  '.hbs',
  exphbs({
    helpers: {
      formatDate,
      stripTags,
      truncate,
      editIcon,
      select,
    },
    defaultLayout: 'main',
    extname: '.hbs',
  })
)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(morgan('dev'));

// Sessions
app.use(
  session({
    secret: 'Tokyo, Japan',
    resave: false,
    saveUninitialized: false,
    store: new mongoStore({ mongooseConnection: mongoose.connection }),
  })
)

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())
require ('./config/passport')(passport);

// Routes
// app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'))

async function updateDB() {
  let usernamesToUpdate = [];
  let returnedUserRecords = await UserModel.find({}, (err, users) => {
    if (err) {
      console.log(err);
    }
    console.log(`users: ${typeof users} ${users}`);
    for (let user of users) {
     usernamesToUpdate.push(user.name);
    }
  });

  // Add logic here if some userNames should not be updated
  console.log(`${usernamesToUpdate} usernamesToUpdate`);
  for (let user of usernamesToUpdate) {
    await updateTweetsForUser(user);
  }
}

updateDB();

const PORT = process.env.PORT || 3000

app.listen(
  PORT,
  console.log(`Server running on ${PORT} in ${process.env.NODE_ENV} mode`)
)
