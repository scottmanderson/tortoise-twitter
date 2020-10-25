const dotenv = require("dotenv");
const express = require("express");
const exphbs = require("express-handlebars");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const morgan = require("morgan");
const passport = require("passport");
const path = require("path");
const session = require("express-session");

const connectDB = require("./config/db");
const updateTweetsForUser = require("./twit-fetch");
const UserModel = require("./models/User");

// Load config from .env
dotenv.config({ path: "./.env" });

const mongoStore = require("connect-mongo")(session);
connectDB();

const app = express();

// Body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Method Override (POST -> PUT/DELETE)
app.use(methodOverride("_method"));

// Static folders
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public/images")));

// view engine configuration
// Handlebars Helpers
const {
  formatDate,
  stripTags,
  truncate,
  editIcon,
  select,
} = require("./helpers/hbs");

// Handlebars
app.engine(
  ".hbs",
  exphbs({
    helpers: {
      formatDate,
      stripTags,
      truncate,
      editIcon,
      select,
    },
    defaultLayout: "main",
    extname: ".hbs",
  })
);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(morgan("dev"));

// Sessions
// code template from express github page
app.use(
  session({
    secret: "Tokyo, Japan",
    resave: false,
    saveUninitialized: false,
    store: new mongoStore({ mongooseConnection: mongoose.connection }),
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
require("./config/passport")(passport);

app.use(flash());

// Routes
app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users"));
app.use("/handles", require("./routes/handles"));
app.use("/posts", require("./routes/posts"));
app.use("/rss", require("./routes/rss"));

async function updateDB() {
  let usernamesToUpdate = [];
  let returnedUserRecords = await UserModel.find({}, (err, users) => {
    if (err) {
      console.log(err);
    }

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

// Database updates, on server setup and daily
updateDB();
function runUpdatePeriodically() {
  // First, run the function as setInterval will not call the function until the end of the period
  updateDB();
  // Set for once daily
  // TODO: Expansion option: run for all desired times
  setInterval(updateDB, 24 * 60 ** 2 * 1000);
  console.log("Running Periodic Update");
}

let now = new Date();
let targetTime = new Date(now).setUTCHours(23);
targetTime =
  targetTime < now
    ? targetTime.setUTCDate(targetTime.getUTCDate() + 1)
    : targetTime;
setTimeout(runUpdatePeriodically, targetTime - now);

module.exports = app;
