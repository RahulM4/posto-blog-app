const path = require('path');
const dotenv = require('dotenv');

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const number = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const boolean = (value, fallback = false) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
  }
  return fallback;
};

const config = {
  env: process.env.NODE_ENV || 'development',
  port: number(process.env.PORT, 4000),
  appName: process.env.APP_NAME || 'POSTO Admin Platform',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  localClientUrl: process.env.LOCAL_CLIENT_URL || '',
  allowRegistration: boolean(process.env.ALLOW_REGISTRATION, true),
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/posto-db'
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev_access_secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },
  resetTokens: {
    expiresMinutes: number(process.env.RESET_TOKEN_EXPIRES_MINUTES, 60)
  },
  email: {
    from: process.env.EMAIL_FROM || 'no-reply@posto.com',
    smtp: {
      host: process.env.SMTP_HOST || 'localhost',
      port: number(process.env.SMTP_PORT, 587),
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    }
  },
  bootstrap: {
    adminToken: process.env.ADMIN_BOOTSTRAP_TOKEN || ''
  }
};

module.exports = config;
