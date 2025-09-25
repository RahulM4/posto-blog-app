const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const authService = require('../services/auth.service');
const config = require('../config/env');
const User = require('../models/user.model');

const buildCookieOptions = () => {
  const isProduction = config.env === 'production';
  return {
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,
    path: '/'
  };
};

const setAuthCookies = (res, tokens) => {
  const cookieOptions = buildCookieOptions();
  res.cookie('accessToken', tokens.accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000
  });
  res.cookie('refreshToken', tokens.refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};

const clearAuthCookies = (res) => {
  const cookieOptions = buildCookieOptions();
  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);
};

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body, req, req.auth);
  if (result.tokens) {
    setAuthCookies(res, result.tokens);
  }
  success(res, 201, {
    user: result.user,
    requiresEmailVerification: result.requiresEmailVerification,
    requiresApproval: result.requiresApproval
  });
});

const login = asyncHandler(async (req, res) => {
  const { user, tokens } = await authService.login(req.body, req);
  setAuthCookies(res, tokens);
  success(res, 200, { user });
});

const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  const { user, tokens } = await authService.refresh(token, req);
  setAuthCookies(res, tokens);
  success(res, 200, { user });
});

const logout = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  await authService.logout(token);
  clearAuthCookies(res);
  success(res, 200, { message: 'Logged out' });
});

const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.auth.id).lean();
  success(res, 200, { user });
});

const requestReset = asyncHandler(async (req, res) => {
  await authService.requestPasswordReset(req.body);
  success(res, 200, { message: 'If that account exists we sent instructions' });
});

const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body);
  success(res, 200, { message: 'Password updated' });
});

const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword({ userId: req.auth.id, ...req.body }, req.auth);
  success(res, 200, { message: 'Password changed' });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const user = await authService.verifyEmail(req.body.token);
  success(res, 200, { user });
});

const bootstrapAdmin = asyncHandler(async (req, res) => {
  const { user, tokens } = await authService.bootstrapAdmin(req.body, req);
  setAuthCookies(res, tokens);
  success(res, 201, { user });
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  me,
  requestReset,
  resetPassword,
  changePassword,
  verifyEmail,
  bootstrapAdmin
};
