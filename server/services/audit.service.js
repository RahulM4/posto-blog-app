const AuditLog = require('../models/auditLog.model');
const { buildPagination, buildSorting } = require('../utils/pagination');

const log = async ({ actorId, action, entityType, entityId, meta }) => {
  return AuditLog.create({ actorId, action, entityType, entityId, meta });
};

const list = async (filters = {}) => {
  const { entityType, actorId, action, from, to } = filters;
  const query = {};
  if (entityType) query.entityType = entityType;
  if (actorId) query.actorId = actorId;
  if (action) query.action = action;
  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to) query.createdAt.$lte = new Date(to);
  }
  const { page, limit, skip } = buildPagination(filters);
  const sort = buildSorting(filters.sort);
  const [items, total] = await Promise.all([
    AuditLog.find(query).sort(sort).skip(skip).limit(limit).populate('actorId', 'name email').lean(),
    AuditLog.countDocuments(query)
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

module.exports = {
  log,
  list
};
