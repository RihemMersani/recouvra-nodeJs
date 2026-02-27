const mongoose = require('mongoose');

module.exports = async function connectDB(uri) {
  if (!uri) throw new Error('MONGO_URI not provided');
  await mongoose.connect(uri, {
    autoIndex: true
  });
  console.log('MongoDB connected');
};
