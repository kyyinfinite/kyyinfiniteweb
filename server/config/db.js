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
      .then(async (connection) => {
        console.log('MongoDB connected');
        try {
          // Snippet/ProjectAsset used to define text indexes for search;
          // search now uses a plain regex instead (see utils/searchQuery.js),
          // so this just lets Mongoose reconcile the collections to the
          // current schema — including dropping the now-retired text index
          // if it's still sitting on an existing deployment.
          const Snippet = require('../models/Snippet');
          const ProjectAsset = require('../models/ProjectAsset');
          await Snippet.syncIndexes();
          await ProjectAsset.syncIndexes();
          console.log('Indexes synced');
        } catch (syncError) {
          console.error('Failed to sync indexes:', syncError.message);
        }
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
