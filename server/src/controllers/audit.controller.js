const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const auditService = require('../services/audit.service');

const list = asyncHandler(async (req, res) => {
  const result = await auditService.list(req.query);
  success(res, 200, result.items, result.meta);
});

module.exports = {
  list
};
