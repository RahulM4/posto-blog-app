// const http = require('http');
// const app = require('./app');
// const config = require('./config/env');
// const { connectDb } = require('./config/database');

// const server = http.createServer(app);

// const start = async () => {
//   try {
//     await connectDb();
//     server.listen(config.port, () => {
//       console.log(`API running on port ${config.port}`);
//     });
//   } catch (error) {
//     console.error('Failed to start server', error);
//     process.exit(1);
//   }
// };

// if (require.main === module) {
//   start();
// }
// module.exports = { app, start };

// api/index.js
const app = require('./app');
const { connectDb } = require('./config/database');

// Connect to DB once at cold start
connectDb()
  .then(() => console.log('DB connected'))
  .catch(err => console.error('DB connection failed', err));

// Export the Express app as serverless handler
module.exports = app;
