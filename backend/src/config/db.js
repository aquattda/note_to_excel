const mongoose = require('mongoose');

async function connectToDatabase(uri) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
}

module.exports = { connectToDatabase };
