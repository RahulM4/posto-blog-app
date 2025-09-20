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

const mongoose = require('mongoose');
const config = require('./env');

mongoose.set('strictQuery', false);

// Cache the connection across function invocations
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDb = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(config.database.uri, {
      autoIndex: config.env !== 'production',
      useNewUrlParser: true,
      useUnifiedTopology: true
    }).then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

const disconnectDb = async () => {
  // Only disconnect in dev mode; don't disconnect in serverless prod
  if (config.env === 'development' && mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
  }
};

module.exports = {
  connectDb,
  disconnectDb
};
