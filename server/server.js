const { connectDb, disconnectDb } = require('./config/database');
const config = require('./config/env');
const app = require('./app');

let serverInstance;

const startServer = async () => {
  if (serverInstance && serverInstance.listening) {
    return serverInstance;
  }

  await connectDb();

  await new Promise((resolve, reject) => {
    serverInstance = app.listen(config.port, () => {
      console.log(`${config.appName} listening on port ${config.port}`);
      resolve();
    });

    serverInstance.on('error', (err) => {
      console.error('Failed to start HTTP server:', err);
      reject(err);
    });
  });

  return serverInstance;
};

const stopServer = async () => {
  if (serverInstance && serverInstance.listening) {
    await new Promise((resolve, reject) => {
      serverInstance.close((err) => {
        if (err) return reject(err);
        resolve();
      });
    });
    serverInstance = null;
  }

  await disconnectDb();
};

const handler = async (req, res) => {
  try {
    await connectDb();
    return app(req, res);
  } catch (err) {
    console.error('DB connect failed:', err);
    res.statusCode = 500;
    res.end('Internal server error');
  }
};

if (require.main === module) {
  startServer().catch((err) => {
    console.error('Server bootstrap failed:', err);
    process.exitCode = 1;
  });
}

module.exports = handler;
module.exports.startServer = startServer;
module.exports.stopServer = stopServer;
module.exports.app = app;
