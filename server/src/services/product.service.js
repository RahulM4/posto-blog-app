const createError = require('http-errors');
const Product = require('../models/product.model');
const auditService = require('./audit.service');
const { buildPagination, buildSorting } = require('../utils/pagination');

const listProducts = async (filters = {}) => {
  const { status, visibility, categoryId, search, includeDeleted } = filters;
  const query = {};
  if (status) query.status = status;
  if (visibility) query.visibility = visibility;
  if (categoryId) query.categoryId = categoryId;
  if (!includeDeleted) query.deletedAt = null;
  if (search) {
    query.$text = { $search: search };
  }
  const { page, limit, skip } = buildPagination(filters);
  const sort = buildSorting(filters.sort);
  const [items, total] = await Promise.all([
    Product.find(query)
      .populate('categoryId', 'name slug')
      .populate('tagIds', 'name slug')
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(query)
  ]);
  return {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

const getProduct = async (idOrSlug) => {
  const query = idOrSlug.match(/^[0-9a-fA-F]{24}$/) ? { _id: idOrSlug } : { slug: idOrSlug };
  const product = await Product.findOne(query)
    .populate('categoryId', 'name slug')
    .populate('tagIds', 'name slug')
    .populate('createdBy', 'name email')
    .lean();
  if (!product || product.deletedAt) {
    throw createError(404, 'Product not found');
  }
  return product;
};

const createProduct = async (payload, actor) => {
  const product = await Product.create({ ...payload, createdBy: actor.id });
  await auditService.log({
    actorId: actor.id,
    action: 'product.create',
    entityType: 'Product',
    entityId: product.id,
    meta: { title: product.title }
  });
  return product.toJSON();
};

const updateProduct = async (id, updates, actor) => {
  const product = await Product.findById(id);
  if (!product || product.deletedAt) throw createError(404, 'Product not found');
  Object.assign(product, updates);
  await product.save();
  await auditService.log({
    actorId: actor.id,
    action: 'product.update',
    entityType: 'Product',
    entityId: product.id,
    meta: updates
  });
  return product.toJSON();
};

const softDelete = async (id, actor) => {
  const product = await Product.findById(id);
  if (!product || product.deletedAt) throw createError(404, 'Product not found');
  product.deletedAt = new Date();
  await product.save();
  await auditService.log({
    actorId: actor.id,
    action: 'product.soft_delete',
    entityType: 'Product',
    entityId: product.id
  });
  return true;
};

const restore = async (id, actor) => {
  const product = await Product.findById(id);
  if (!product) throw createError(404, 'Product not found');
  product.deletedAt = null;
  await product.save();
  await auditService.log({
    actorId: actor.id,
    action: 'product.restore',
    entityType: 'Product',
    entityId: product.id
  });
  return product.toJSON();
};

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  softDelete,
  restore
};
