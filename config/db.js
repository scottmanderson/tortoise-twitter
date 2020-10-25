const mongoose = require("mongoose");

const connectDB = async (mode = "normal") => {
  mongoURI =
    mode !== "test" ? process.env.MONGO_URI : process.env.MONGO_URI + "-test";
  try {
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

module.exports = connectDB;
