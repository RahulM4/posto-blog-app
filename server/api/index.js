// api/index.js
const { connectDb } = require('../config/database');
const app = require('../app');

// Vercel serverless entrypoint
module.exports = async (req, res) => {
  try {
    await connectDb();          // make sure DB is ready
    return app(req, res);       // let Express handle the route (mounted at /api)
  } catch (err) {
    console.error('DB connect failed:', err);
    res.statusCode = 500;
    res.end('Internal server error');
  }
};
