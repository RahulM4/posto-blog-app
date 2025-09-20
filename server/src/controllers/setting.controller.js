const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const settingService = require('../services/setting.service');

const get = asyncHandler(async (req, res) => {
  const settings = await settingService.getSettings();
  success(res, 200, { settings });
});

const update = asyncHandler(async (req, res) => {
  const settings = await settingService.updateSettings(req.body, req.auth);
  success(res, 200, { settings });
});

module.exports = {
  get,
  update
};
