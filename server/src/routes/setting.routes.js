const express = require('express');
const validate = require('../middleware/validate');
const { requireAuth, requirePermission } = require('../middleware/auth');
const settingController = require('../controllers/setting.controller');
const { updateSettingsSchema } = require('../validators/setting.validators');
const { PERMISSIONS } = require('../config/rbac');

const router = express.Router();

router.use(requireAuth, requirePermission(PERMISSIONS.SETTINGS_MANAGE));

router.get('/', settingController.get);
router.put('/', validate(updateSettingsSchema), settingController.update);

module.exports = router;
