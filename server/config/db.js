const mongoose = require('mongoose');

let cachedConnectionPromise = null;

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not defined');
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!cachedConnectionPromise) {
    mongoose.set('strictQuery', true);
    mongoose.set('bufferCommands', false);

    cachedConnectionPromise = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 8000,
        connectTimeoutMS: 8000,
        maxPoolSize: 5,
      })
      .then((connection) => {
        console.log('MongoDB connected');
        return connection;
      })
      .catch((error) => {
        cachedConnectionPromise = null;
        console.error('MongoDB connection failed:', error.message);
        throw error;
      });
  }

  return cachedConnectionPromise;
}

module.exports = { connectDB };
