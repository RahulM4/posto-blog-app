const express = require('express');
const { requireAuth, requirePermission } = require('../middleware/auth');
const auditController = require('../controllers/audit.controller');
const { PERMISSIONS } = require('../config/rbac');

const router = express.Router();

router.use(requireAuth, requirePermission(PERMISSIONS.AUDIT_VIEW));

router.get('/', auditController.list);

module.exports = router;
