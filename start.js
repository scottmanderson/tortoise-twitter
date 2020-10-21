const dotenv = require("dotenv");
const app = require("./server");

const PORT = process.env.PORT || 3000;

app.listen(
  PORT,
  console.log(`Server running on ${PORT} in ${process.env.NODE_ENV} mode`)
);
