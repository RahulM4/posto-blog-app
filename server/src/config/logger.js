const morgan = require('morgan');
const config = require('./env');

const stream = {
  write: (message) => {
    if (config.env !== 'test') {
      process.stdout.write(message);
    }
  }
};

const requestLogger = () => morgan('dev', { stream });

module.exports = {
  requestLogger
};
