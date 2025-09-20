const Setting = require('../models/setting.model');
const auditService = require('./audit.service');

const DEFAULT_SETTINGS = {
  app: {
    name: 'MERN Admin Platform',
    logo: null
  },
  email: {
    welcomeTemplate: 'Welcome to {{appName}}',
    resetTemplate: 'Reset your password using the provided link'
  },
  features: {
    allowRegistration: true
  }
};

const getSettings = async () => {
  const records = await Setting.find({}).lean();
  const settings = { ...DEFAULT_SETTINGS };
  records.forEach((record) => {
    settings[record.key] = record.value;
  });
  return settings;
};

const updateSettings = async (payload, actor) => {
  const entries = Object.entries(payload);
  for (const [key, value] of entries) {
    await Setting.findOneAndUpdate(
      { key },
      { value },
      { upsert: true, new: true }
    );
  }
  await auditService.log({
    actorId: actor.id,
    action: 'settings.update',
    entityType: 'Setting',
    entityId: actor.id,
    meta: payload
  });
  return getSettings();
};

module.exports = {
  getSettings,
  updateSettings
};
