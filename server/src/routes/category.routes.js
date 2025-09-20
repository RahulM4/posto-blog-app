const express = require('express');
const validate = require('../middleware/validate');
const { requireAuth, requirePermission } = require('../middleware/auth');
const categoryController = require('../controllers/category.controller');
const { createCategorySchema, updateCategorySchema } = require('../validators/category.validators');
const { PERMISSIONS } = require('../config/rbac');

const router = express.Router();

router.get('/', categoryController.list);

router.use(requireAuth, requirePermission(PERMISSIONS.CATEGORY_MANAGE));

router.post('/', validate(createCategorySchema), categoryController.create);
router.patch('/:categoryId', validate(updateCategorySchema), categoryController.update);
router.delete('/:categoryId', categoryController.remove);

module.exports = router;
