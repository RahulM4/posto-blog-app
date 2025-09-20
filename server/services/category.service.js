const createError = require('http-errors');
const slugify = require('slugify');
const Category = require('../models/category.model');
const auditService = require('./audit.service');

const listCategories = async (type) => {
  const query = type ? { type } : {};
  return Category.find(query).sort({ name: 1 }).lean();
};

const createCategory = async (payload, actor) => {
  const slug = payload.slug || slugify(payload.name, { lower: true, strict: true });
  const existing = await Category.findOne({ slug, type: payload.type });
  if (existing) throw createError(409, 'Category already exists');
  const category = await Category.create({ ...payload, slug });
  await auditService.log({
    actorId: actor.id,
    action: 'category.create',
    entityType: 'Category',
    entityId: category.id
  });
  return category.toJSON();
};

const updateCategory = async (id, updates, actor) => {
  const category = await Category.findById(id);
  if (!category) throw createError(404, 'Category not found');
  const updated = { ...updates };
  if (updates.name && !updates.slug) {
    updated.slug = slugify(updates.name, { lower: true, strict: true });
  }
  Object.assign(category, updated);
  await category.save();
  await auditService.log({
    actorId: actor.id,
    action: 'category.update',
    entityType: 'Category',
    entityId: category.id
  });
  return category.toJSON();
};

const removeCategory = async (id, actor) => {
  const category = await Category.findById(id);
  if (!category) throw createError(404, 'Category not found');
  await Category.deleteOne({ _id: id });
  await auditService.log({
    actorId: actor.id,
    action: 'category.delete',
    entityType: 'Category',
    entityId: id
  });
  return true;
};

module.exports = {
  listCategories,
  createCategory,
  updateCategory,
  removeCategory
};
