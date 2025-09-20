const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const productService = require('../services/product.service');

const list = asyncHandler(async (req, res) => {
  const result = await productService.listProducts(req.query);
  success(res, 200, result.items, result.meta);
});

const get = asyncHandler(async (req, res) => {
  const product = await productService.getProduct(req.params.productIdOrSlug);
  success(res, 200, { product });
});

const create = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body, req.auth);
  success(res, 201, { product });
});

const update = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.productId, req.body, req.auth);
  success(res, 200, { product });
});

const softDelete = asyncHandler(async (req, res) => {
  await productService.softDelete(req.params.productId, req.auth);
  success(res, 200, { message: 'Product moved to trash' });
});

const restore = asyncHandler(async (req, res) => {
  const product = await productService.restore(req.params.productId, req.auth);
  success(res, 200, { product });
});

module.exports = {
  list,
  get,
  create,
  update,
  softDelete,
  restore
};
