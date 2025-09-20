const express = require('express');
const validate = require('../middleware/validate');
const { requireAuth, requirePermission } = require('../middleware/auth');
const tagController = require('../controllers/tag.controller');
const { createTagSchema, updateTagSchema } = require('../validators/tag.validators');
const { PERMISSIONS } = require('../config/rbac');

const router = express.Router();

router.get('/', tagController.list);

router.use(requireAuth, requirePermission(PERMISSIONS.TAG_MANAGE));

router.post('/', validate(createTagSchema), tagController.create);
router.patch('/:tagId', validate(updateTagSchema), tagController.update);
router.delete('/:tagId', tagController.remove);

module.exports = router;
