const fs = require('fs');
const path = require('path');
const createError = require('http-errors');
const Media = require('../models/media.model');
const auditService = require('./audit.service');
const { buildPagination, buildSorting } = require('../utils/pagination');

const UPLOADS_DIR = path.resolve(process.cwd(), 'server/uploads');

const ensureUploadsDir = () => {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
};

const storeMedia = async (file, actor) => {
  ensureUploadsDir();
  const filename = `${Date.now()}-${file.originalname}`;
  const filePath = path.join(UPLOADS_DIR, filename);
  fs.writeFileSync(filePath, file.buffer);
  const media = await Media.create({
    url: `/uploads/${filename}`,
    filename,
    size: file.size,
    mimeType: file.mimetype,
    uploadedBy: actor.id
  });
  await auditService.log({
    actorId: actor.id,
    action: 'media.upload',
    entityType: 'Media',
    entityId: media.id
  });
  return media.toJSON();
};

const listMedia = async (filters = {}) => {
  const { page, limit, skip } = buildPagination(filters);
  const sort = buildSorting(filters.sort || 'createdAt:desc');
  const [items, total] = await Promise.all([
    Media.find({}).sort(sort).skip(skip).limit(limit).lean(),
    Media.countDocuments({})
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

const removeMedia = async (id, actor) => {
  const media = await Media.findById(id);
  if (!media) throw createError(404, 'Media not found');
  const filePath = path.join(UPLOADS_DIR, media.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  await Media.deleteOne({ _id: id });
  await auditService.log({
    actorId: actor.id,
    action: 'media.delete',
    entityType: 'Media',
    entityId: id
  });
  return true;
};

module.exports = {
  storeMedia,
  listMedia,
  removeMedia
};
