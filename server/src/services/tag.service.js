const createError = require('http-errors');
const slugify = require('slugify');
const Tag = require('../models/tag.model');
const auditService = require('./audit.service');

const listTags = async (type) => {
  const query = type ? { type } : {};
  return Tag.find(query).sort({ name: 1 }).lean();
};

const createTag = async (payload, actor) => {
  const slug = payload.slug || slugify(payload.name, { lower: true, strict: true });
  const existing = await Tag.findOne({ slug, type: payload.type });
  if (existing) throw createError(409, 'Tag already exists');
  const tag = await Tag.create({ ...payload, slug });
  await auditService.log({
    actorId: actor.id,
    action: 'tag.create',
    entityType: 'Tag',
    entityId: tag.id
  });
  return tag.toJSON();
};

const updateTag = async (id, updates, actor) => {
  const tag = await Tag.findById(id);
  if (!tag) throw createError(404, 'Tag not found');
  const updated = { ...updates };
  if (updates.name && !updates.slug) {
    updated.slug = slugify(updates.name, { lower: true, strict: true });
  }
  Object.assign(tag, updated);
  await tag.save();
  await auditService.log({
    actorId: actor.id,
    action: 'tag.update',
    entityType: 'Tag',
    entityId: tag.id
  });
  return tag.toJSON();
};

const removeTag = async (id, actor) => {
  const tag = await Tag.findById(id);
  if (!tag) throw createError(404, 'Tag not found');
  await Tag.deleteOne({ _id: id });
  await auditService.log({
    actorId: actor.id,
    action: 'tag.delete',
    entityType: 'Tag',
    entityId: id
  });
  return true;
};

module.exports = {
  listTags,
  createTag,
  updateTag,
  removeTag
};
