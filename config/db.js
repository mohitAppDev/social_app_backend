const mongoose = require('mongoose');
require("dotenv").config();
const db = process.env.MONGO_CLOUD_URL

const connectDB = async () => {
  try {
    await mongoose.connect(
      db,
      { useNewUrlParser: true, useUnifiedTopology: true,useCreateIndex: true ,useFindAndModify: false },
    );

    console.log('MongoDB is Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;