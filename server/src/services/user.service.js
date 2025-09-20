const createError = require('http-errors');
const User = require('../models/user.model');
const { hashPassword } = require('../utils/password');
const { buildPagination, buildSorting } = require('../utils/pagination');
const { ROLES } = require('../config/rbac');
const auditService = require('./audit.service');

const listUsers = async (filters = {}) => {
  const { search, status, role, approvalStatus, includeDeleted } = filters;
  const query = {};
  if (status) query.status = status;
  if (role) query.role = role;
  if (approvalStatus) query.approvalStatus = approvalStatus;
  if (!includeDeleted) query.deletedAt = null;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  const { page, limit, skip } = buildPagination(filters);
  const sort = buildSorting(filters.sort);
  const [items, total] = await Promise.all([
    User.find(query).sort(sort).skip(skip).limit(limit).lean(),
    User.countDocuments(query)
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

const getUser = async (id) => {
  const user = await User.findById(id).lean();
  if (!user) {
    throw createError(404, 'User not found');
  }
  return user;
};

const createUser = async (payload, actor) => {
  const { name, email, password, role = ROLES.USER } = payload;
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw createError(409, 'Email already registered');
  }
  if (role !== ROLES.USER) {
    const canAssign = (actor.permissions || []).includes('user:assignRole');
    if (!canAssign) {
      throw createError(403, 'You cannot assign elevated roles');
    }
    if (role === ROLES.SUPER_ADMIN && actor.role !== ROLES.SUPER_ADMIN) {
      throw createError(403, 'Only SuperAdmin can assign SuperAdmin role');
    }
  }
  const passwordHash = await hashPassword(password);
  const now = new Date();
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role,
    status: 'active',
    approvalStatus: 'approved',
    emailVerifiedAt: now,
    approvedBy: actor.id,
    approvedAt: now
  });
  await auditService.log({
    actorId: actor.id,
    action: 'user.create',
    entityType: 'User',
    entityId: user.id,
    meta: { role: user.role }
  });
  return user.toJSON();
};

const updateUser = async (id, updates, actor) => {
  const user = await User.findById(id);
  if (!user) {
    throw createError(404, 'User not found');
  }
  if (updates.name) user.name = updates.name;
  if (updates.email) user.email = updates.email.toLowerCase();
  if (updates.role && updates.role !== user.role) {
    const canAssign = (actor.permissions || []).includes('user:assignRole');
    if (!canAssign) {
      throw createError(403, 'You cannot assign elevated roles');
    }
    if (updates.role === ROLES.SUPER_ADMIN && actor.role !== ROLES.SUPER_ADMIN) {
      throw createError(403, 'Only SuperAdmin can assign SuperAdmin role');
    }
    user.role = updates.role;
  }
  if (updates.status) user.status = updates.status;
  if (updates.avatarUrl !== undefined) user.avatarUrl = updates.avatarUrl;
  await user.save();
  await auditService.log({
    actorId: actor.id,
    action: 'user.update',
    entityType: 'User',
    entityId: user.id,
    meta: updates
  });
  return user.toJSON();
};

const setStatus = async (id, status, actor) => {
  const user = await User.findById(id);
  if (!user) throw createError(404, 'User not found');
  user.status = status;
  await user.save();
  await auditService.log({
    actorId: actor.id,
    action: `user.status.${status}`,
    entityType: 'User',
    entityId: user.id
  });
  return user.toJSON();
};

const setApprovalStatus = async (id, approvalStatus, actor, note) => {
  const user = await User.findById(id);
  if (!user) throw createError(404, 'User not found');

  user.approvalStatus = approvalStatus;

  if (approvalStatus === 'approved') {
    user.approvedBy = actor.id;
    user.approvedAt = new Date();
    if (user.emailVerifiedAt) {
      user.status = 'active';
    } else if (user.status !== 'inactive') {
      user.status = 'pending';
    }
  } else if (approvalStatus === 'rejected') {
    user.approvedBy = actor.id;
    user.approvedAt = new Date();
    user.status = 'inactive';
  } else {
    user.approvedBy = undefined;
    user.approvedAt = undefined;
    if (user.status !== 'inactive') {
      user.status = 'pending';
    }
  }

  await user.save();

  await auditService.log({
    actorId: actor.id,
    action: `user.approval.${approvalStatus}`,
    entityType: 'User',
    entityId: user.id,
    meta: note ? { note } : undefined
  });

  return user.toJSON();
};

const softDelete = async (id, actor) => {
  const user = await User.findById(id);
  if (!user) throw createError(404, 'User not found');
  user.deletedAt = new Date();
  user.status = 'inactive';
  await user.save();
  await auditService.log({
    actorId: actor.id,
    action: 'user.soft_delete',
    entityType: 'User',
    entityId: user.id
  });
  return true;
};

const restore = async (id, actor) => {
  const user = await User.findById(id);
  if (!user) throw createError(404, 'User not found');
  user.deletedAt = null;
  user.status = 'active';
  await user.save();
  await auditService.log({
    actorId: actor.id,
    action: 'user.restore',
    entityType: 'User',
    entityId: user.id
  });
  return user.toJSON();
};

const hardDelete = async (id, actor) => {
  const user = await User.findById(id);
  if (!user) throw createError(404, 'User not found');
  await User.deleteOne({ _id: id });
  await auditService.log({
    actorId: actor.id,
    action: 'user.hard_delete',
    entityType: 'User',
    entityId: id
  });
  return true;
};

const bulkStatus = async ({ ids, status }, actor) => {
  await User.updateMany({ _id: { $in: ids } }, { status });
  await auditService.log({
    actorId: actor.id,
    action: 'user.bulk_status',
    entityType: 'User',
    entityId: actor.id,
    meta: { ids, status }
  });
  return true;
};

module.exports = {
  listUsers,
  getUser,
  createUser,
  updateUser,
  setStatus,
  setApprovalStatus,
  softDelete,
  restore,
  hardDelete,
  bulkStatus
};
