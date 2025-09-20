const createError = require('http-errors');
const { verifyAccessToken } = require('../utils/token');
const { ROLES, rolePermissions } = require('../config/rbac');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/user.model');

const extractToken = (req) => {
  if (req.cookies?.accessToken) {
    return req.cookies.accessToken;
  }
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  return null;
};

const requireAuth = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    throw createError(401, 'Authentication required');
  }
  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (error) {
    throw createError(401, 'Invalid or expired token');
  }
  const user = await User.findById(payload.sub);
  if (!user || user.deletedAt || user.status !== 'active') {
    throw createError(403, 'Account disabled or not found');
  }
  req.auth = {
    id: user.id,
    role: user.role,
    permissions: rolePermissions[user.role] || []
  };
  req.user = user;
  next();
});

const requireRole = (...roles) =>
  asyncHandler(async (req, res, next) => {
    const allowed = roles.includes(req.auth?.role);
    if (!allowed) {
      throw createError(403, 'Insufficient role');
    }
    next();
  });

const requirePermission = (...permissions) =>
  asyncHandler(async (req, res, next) => {
    const userPermissions = req.auth?.permissions || [];
    const hasAll = permissions.every((perm) => userPermissions.includes(perm));
    if (!hasAll) {
      throw createError(403, 'Permission denied');
    }
    next();
  });

const allowIfSelfOrRole = (userIdParam, ...roles) =>
  asyncHandler(async (req, res, next) => {
    const targetId = req.params[userIdParam] || req.body[userIdParam];
    if (targetId && targetId === req.auth?.id) {
      return next();
    }
    if (roles.includes(req.auth?.role)) {
      return next();
    }
    throw createError(403, 'Insufficient permission');
  });

module.exports = {
  requireAuth,
  requireRole,
  requirePermission,
  allowIfSelfOrRole,
  ROLES
};
