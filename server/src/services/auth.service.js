const crypto = require('crypto');
const dayjs = require('dayjs');
const createError = require('http-errors');
const { v4: uuid } = require('uuid');
const config = require('../config/env');
const { rolePermissions, ROLES } = require('../config/rbac');
const User = require('../models/user.model');
const RefreshToken = require('../models/refreshToken.model');
const PasswordResetToken = require('../models/passwordResetToken.model');
const EmailVerificationToken = require('../models/emailVerificationToken.model');
const { hashPassword, comparePassword } = require('../utils/password');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/token');
const { sendMail, buildResetEmail, buildVerificationEmail } = require('../utils/email');
const auditService = require('./audit.service');

const buildAuthResponse = async (user, req) => {
  const payload = {
    sub: user.id,
    role: user.role,
    permissions: rolePermissions[user.role] || []
  };
  const accessToken = signAccessToken(payload);
  const refreshJti = uuid();
  const refreshToken = signRefreshToken({ ...payload, jti: refreshJti });
  const decodedRefresh = verifyRefreshToken(refreshToken);
  const expiresAt = dayjs(decodedRefresh.exp * 1000).toDate();
  await RefreshToken.create({
    userId: user.id,
    token: refreshJti,
    expiresAt,
    createdByIp: req.ip
  });
  user.lastLoginAt = new Date();
  await user.save();
  await auditService.log({
    actorId: user.id,
    action: 'auth.login',
    entityType: 'User',
    entityId: user.id,
    meta: { ip: req.ip }
  });
  return { accessToken, refreshToken };
};

const issueVerificationToken = async (userId) => {
  await EmailVerificationToken.deleteMany({ userId });
  const token = crypto.randomBytes(40).toString('hex');
  const expiresAt = dayjs().add(48, 'hour').toDate();
  await EmailVerificationToken.create({ userId, token, expiresAt });
  return token;
};

const register = async ({ name, email, password, role }, req, actor) => {
  if (!config.allowRegistration && !actor) {
    throw createError(403, 'Registrations are disabled');
  }
  const normalizedEmail = email.toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    throw createError(409, 'Email already registered');
  }
  const passwordHash = await hashPassword(password);
  let roleToUse = ROLES.USER;
  if (actor) {
    if (role && role !== ROLES.USER) {
      const hasPermission = (actor.permissions || []).includes('user:assignRole');
      if (!hasPermission) {
        throw createError(403, 'You cannot assign elevated roles');
      }
      roleToUse = role;
    } else if (role) {
      roleToUse = role;
    }
  }

  if (actor) {
    const now = new Date();
    const user = await User.create({
      name,
      email: normalizedEmail,
      passwordHash,
      role: roleToUse,
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
    return {
      user: user.toJSON(),
      tokens: null,
      requiresEmailVerification: false,
      requiresApproval: false
    };
  }

  const user = await User.create({
    name,
    email: normalizedEmail,
    passwordHash,
    role: roleToUse,
    status: 'pending',
    approvalStatus: 'pending'
  });

  const token = await issueVerificationToken(user.id);
  const { subject, html, text } = buildVerificationEmail(token);
  await sendMail({ to: user.email, subject, html, text });
  await auditService.log({
    actorId: user.id,
    action: 'auth.register_pending',
    entityType: 'User',
    entityId: user.id
  });

  return {
    user: user.toJSON(),
    tokens: null,
    requiresEmailVerification: true,
    requiresApproval: true
  };
};

const login = async ({ email, password }, req) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || user.deletedAt) {
    throw createError(401, 'Invalid credentials');
  }
  if (!user.emailVerifiedAt) {
    throw createError(403, 'Email not verified');
  }
  if (user.approvalStatus !== 'approved') {
    throw createError(403, 'Account awaiting approval');
  }
  if (user.status !== 'active') {
    throw createError(403, 'Account inactive');
  }
  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    throw createError(401, 'Invalid credentials');
  }
  const tokens = await buildAuthResponse(user, req);
  return { user, tokens };
};

const refresh = async (refreshToken, req) => {
  try {
    const payload = verifyRefreshToken(refreshToken);
    const tokenDoc = await RefreshToken.findOne({ token: payload.jti, revokedAt: { $exists: false } });
    if (!tokenDoc) {
      throw createError(401, 'Session expired');
    }
    if (dayjs(tokenDoc.expiresAt).isBefore(dayjs())) {
      throw createError(401, 'Session expired');
    }
    const user = await User.findById(payload.sub);
    if (!user || user.deletedAt || user.status !== 'active') {
      throw createError(403, 'Account unavailable');
    }
    tokenDoc.revokedAt = new Date();
    tokenDoc.replacedByToken = payload.jti;
    await tokenDoc.save();
    const tokens = await buildAuthResponse(user, req);
    return { user, tokens };
  } catch (error) {
    if (error.statusCode) throw error;
    throw createError(401, 'Invalid refresh token');
  }
};

const logout = async (refreshToken) => {
  try {
    const payload = verifyRefreshToken(refreshToken);
    await RefreshToken.findOneAndUpdate({ token: payload.jti }, { revokedAt: new Date() });
  } catch (error) {
    // ignore invalid token
  }
  return true;
};

const changePassword = async ({ userId, currentPassword, newPassword }, actor) => {
  const user = await User.findById(userId);
  if (!user) {
    throw createError(404, 'User not found');
  }
  const matches = await comparePassword(currentPassword, user.passwordHash);
  if (!matches) {
    throw createError(400, 'Current password incorrect');
  }
  user.passwordHash = await hashPassword(newPassword);
  await user.save();
  await auditService.log({
    actorId: actor.id,
    action: 'user.change_password',
    entityType: 'User',
    entityId: user.id
  });
  return user;
};

const requestPasswordReset = async ({ email }) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return; // do not leak existence
  }
  await PasswordResetToken.deleteMany({ userId: user.id });
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = dayjs().add(config.resetTokens.expiresMinutes, 'minute').toDate();
  await PasswordResetToken.create({ userId: user.id, token, expiresAt });
  const { subject, html, text } = buildResetEmail(token);
  await sendMail({ to: user.email, subject, html, text });
  await auditService.log({
    actorId: user.id,
    action: 'auth.reset_requested',
    entityType: 'User',
    entityId: user.id
  });
};

const resetPassword = async ({ token, password }) => {
  const entry = await PasswordResetToken.findOne({ token });
  if (!entry || entry.usedAt || dayjs(entry.expiresAt).isBefore(dayjs())) {
    throw createError(400, 'Token invalid or expired');
  }
  const user = await User.findById(entry.userId);
  if (!user) {
    throw createError(404, 'User not found');
  }
  user.passwordHash = await hashPassword(password);
  await user.save();
  entry.usedAt = new Date();
  await entry.save();
  await auditService.log({
    actorId: user.id,
    action: 'auth.password_reset',
    entityType: 'User',
    entityId: user.id
  });
  return user;
};

const verifyEmail = async (token) => {
  const entry = await EmailVerificationToken.findOne({ token });
  if (!entry || entry.usedAt || dayjs(entry.expiresAt).isBefore(dayjs())) {
    throw createError(400, 'Verification link is invalid or expired');
  }
  const user = await User.findById(entry.userId);
  if (!user || user.deletedAt) {
    throw createError(404, 'Account not found');
  }
  user.emailVerifiedAt = new Date();
  if (user.approvalStatus === 'approved') {
    user.status = 'active';
  } else if (user.status !== 'inactive') {
    user.status = 'pending';
  }
  await user.save();

  entry.usedAt = new Date();
  await entry.save();
  await EmailVerificationToken.deleteMany({ userId: user.id, _id: { $ne: entry.id } });

  await auditService.log({
    actorId: user.id,
    action: 'auth.email_verified',
    entityType: 'User',
    entityId: user.id
  });

  return user.toJSON();
};

const bootstrapAdmin = async ({ bootstrapToken, name, email, password }, req) => {
  if (!config.bootstrap.adminToken) {
    throw createError(403, 'Admin bootstrap is disabled');
  }
  if (bootstrapToken !== config.bootstrap.adminToken) {
    throw createError(403, 'Invalid bootstrap token');
  }
  const normalizedEmail = email.toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    throw createError(409, 'Email already registered');
  }
  const passwordHash = await hashPassword(password);
  const now = new Date();
  const user = await User.create({
    name,
    email: normalizedEmail,
    passwordHash,
    role: ROLES.ADMIN,
    status: 'active',
    approvalStatus: 'approved',
    emailVerifiedAt: now,
    approvedBy: undefined,
    approvedAt: now
  });
  user.approvedBy = user.id;
  await user.save();
  await auditService.log({
    actorId: user.id,
    action: 'auth.bootstrap_admin',
    entityType: 'User',
    entityId: user.id
  });
  const tokens = await buildAuthResponse(user, req);
  return { user: user.toJSON(), tokens };
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  changePassword,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  bootstrapAdmin
};
