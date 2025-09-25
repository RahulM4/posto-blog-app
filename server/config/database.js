const mongoose = require('mongoose');
const config = require('./env');

mongoose.set('strictQuery', false);

const connectDb = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  const conn = await mongoose.connect(config.database.uri, {
    autoIndex: config.env !== 'production'
  });

  // Log once when a fresh connection is established
  console.log('Database connected');

  return conn;
};

const disconnectDb = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};

module.exports = {
  connectDb,
  disconnectDb
};
