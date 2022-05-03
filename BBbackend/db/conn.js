const mongoose = require("mongoose");
//Set up default mongoose connection
const dotenv = require("dotenv");
dotenv.config();
var mongoDB = process.env.DBURI;

mongoose
  .connect(mongoDB, { useNewUrlParser: true })
  .then(() => {
    console.log("connection successful");
  })
  .catch((e) => {
    console.log("no connection", e);
  });
//Get the default connection
var db = mongoose.connection;
//Bind connection to error event (to get notification of connection errors)
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.on("error", console.error.bind(console, "MongoDB connection error:"));
