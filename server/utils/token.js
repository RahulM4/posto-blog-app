const jwt = require('jsonwebtoken');
const config = require('../config/env');

const signAccessToken = (payload, options = {}) =>
  jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
    ...options
  });

const signRefreshToken = (payload, options = {}) =>
  jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
    ...options
  });

const verifyAccessToken = (token) =>
  jwt.verify(token, config.jwt.accessSecret);

const verifyRefreshToken = (token) =>
  jwt.verify(token, config.jwt.refreshSecret);

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};
