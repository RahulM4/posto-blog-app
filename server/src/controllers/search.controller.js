const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const searchService = require('../services/search.service');

const global = asyncHandler(async (req, res) => {
  const result = await searchService.globalSearch(req.query.q, req.query);
  success(res, 200, result.items, result.meta);
});

module.exports = {
  global
};
