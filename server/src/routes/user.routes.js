const express = require('express');
const validate = require('../middleware/validate');
const { requireAuth, requirePermission, requireRole, ROLES } = require('../middleware/auth');
const userController = require('../controllers/user.controller');
const {
  createUserSchema,
  updateUserSchema,
  statusSchema,
  bulkStatusSchema,
  approvalSchema
} = require('../validators/user.validators');
const { PERMISSIONS } = require('../config/rbac');

const router = express.Router();

router.use(requireAuth);

router.get('/', requirePermission(PERMISSIONS.USER_VIEW), userController.list);
router.post('/', requirePermission(PERMISSIONS.USER_MANAGE), validate(createUserSchema), userController.create);
router.post('/bulk/status', requirePermission(PERMISSIONS.USER_MANAGE), validate(bulkStatusSchema), userController.bulkStatus);
router.get('/:userId', requirePermission(PERMISSIONS.USER_VIEW), userController.get);
router.patch('/:userId', requirePermission(PERMISSIONS.USER_MANAGE), validate(updateUserSchema), userController.update);
router.post('/:userId/status', requirePermission(PERMISSIONS.USER_MANAGE), validate(statusSchema), userController.setStatus);
router.post(
  '/:userId/approval',
  requirePermission(PERMISSIONS.USER_MANAGE),
  validate(approvalSchema),
  userController.setApproval
);
router.delete('/:userId', requirePermission(PERMISSIONS.USER_MANAGE), userController.softDelete);
router.post('/:userId/restore', requirePermission(PERMISSIONS.USER_MANAGE), userController.restore);
router.delete('/:userId/hard', requireRole(ROLES.SUPER_ADMIN), userController.hardDelete);

module.exports = router;
