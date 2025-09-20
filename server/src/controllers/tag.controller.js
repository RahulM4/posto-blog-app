const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const tagService = require('../services/tag.service');

const list = asyncHandler(async (req, res) => {
  const tags = await tagService.listTags(req.query.type);
  success(res, 200, { tags });
});

const create = asyncHandler(async (req, res) => {
  const tag = await tagService.createTag(req.body, req.auth);
  success(res, 201, { tag });
});

const update = asyncHandler(async (req, res) => {
  const tag = await tagService.updateTag(req.params.tagId, req.body, req.auth);
  success(res, 200, { tag });
});

const remove = asyncHandler(async (req, res) => {
  await tagService.removeTag(req.params.tagId, req.auth);
  success(res, 200, { message: 'Tag removed' });
});

module.exports = {
  list,
  create,
  update,
  remove
};
