const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  trackedHandles: {
    type: Array,
    default: [],
  },
  preferredTimeGMT: {
    type: String,
    default: "23:00",
  },
});

module.exports = mongoose.model("User", UserSchema);
