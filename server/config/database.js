// const mongoose = require('mongoose');
// const config = require('./env');

// mongoose.set('strictQuery', false);

// const connectDb = async () => {
//   if (mongoose.connection.readyState === 1) {
//     return mongoose.connection;
//   }
//   const conn = await mongoose.connect(config.database.uri, {
//     autoIndex: config.env !== 'production'
//   });
//   return conn;
// };

// const disconnectDb = async () => {
//   if (mongoose.connection.readyState !== 0) {
//     await mongoose.disconnect();
//   }
// };

// module.exports = {
//   connectDb,
//   disconnectDb
// };


// config/database.js
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
// optional: const DB_NAME = process.env.MONGODB_DB || 'posto';

if (!MONGODB_URI) {
  throw new Error('Missing MONGODB_URI env var');
}

// Avoid mongoose buffering (the thing causing your visible error)
mongoose.set('bufferCommands', false);

// Reuse the connection across hot starts / serverless invocations
let cached = global._mongoose;
if (!cached) cached = global._mongoose = { conn: null, promise: null };

async function connectDb() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        // dbName: DB_NAME, // uncomment if you need a specific DB
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000, // fail fast
        retryWrites: true,
      })
      .then((m) => m.connection);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = { connectDb };
