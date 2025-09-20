const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const categoryService = require('../services/category.service');

const list = asyncHandler(async (req, res) => {
  const categories = await categoryService.listCategories(req.query.type);
  success(res, 200, { categories });
});

const create = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body, req.auth);
  success(res, 201, { category });
});

const update = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.categoryId, req.body, req.auth);
  success(res, 200, { category });
});

const remove = asyncHandler(async (req, res) => {
  await categoryService.removeCategory(req.params.categoryId, req.auth);
  success(res, 200, { message: 'Category removed' });
});

module.exports = {
  list,
  create,
  update,
  remove
};
