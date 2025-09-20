const express = require('express');
const validate = require('../middleware/validate');
const { authRateLimiter } = require('../middleware/rateLimit');
const { requireAuth } = require('../middleware/auth');
const authController = require('../controllers/auth.controller');
const {
  registerSchema,
  loginSchema,
  requestResetSchema,
  resetPasswordSchema,
  changePasswordSchema,
  verifyEmailSchema,
  bootstrapAdminSchema
} = require('../validators/auth.validators');

const router = express.Router();

router.post('/register', authRateLimiter, validate(registerSchema), authController.register);
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.me);
router.post('/forgot-password', authRateLimiter, validate(requestResetSchema), authController.requestReset);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);
router.post('/change-password', requireAuth, validate(changePasswordSchema), authController.changePassword);
router.post('/verify-email', authRateLimiter, validate(verifyEmailSchema), authController.verifyEmail);
router.post('/bootstrap-admin', authRateLimiter, validate(bootstrapAdminSchema), authController.bootstrapAdmin);

module.exports = router;
