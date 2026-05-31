const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI;
  console.log('MONGO_URI:', uri);

  if (!uri) {
    throw new Error('MONGO_URI is not set. Copy .env.example to .env and fill it in.');
  }
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');
}

module.exports = connectDB;
