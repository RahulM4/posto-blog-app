const express = require('express');
const validate = require('../middleware/validate');
const { requireAuth, requirePermission } = require('../middleware/auth');
const productController = require('../controllers/product.controller');
const { createProductSchema, updateProductSchema } = require('../validators/product.validators');
const { PERMISSIONS } = require('../config/rbac');

const router = express.Router();

router.use(requireAuth);

router.get('/', requirePermission(PERMISSIONS.PRODUCT_VIEW), productController.list);
router.post('/', requirePermission(PERMISSIONS.PRODUCT_MANAGE), validate(createProductSchema), productController.create);
router.get('/:productIdOrSlug', requirePermission(PERMISSIONS.PRODUCT_VIEW), productController.get);
router.patch('/:productId', requirePermission(PERMISSIONS.PRODUCT_MANAGE), validate(updateProductSchema), productController.update);
router.delete('/:productId', requirePermission(PERMISSIONS.PRODUCT_MANAGE), productController.softDelete);
router.post('/:productId/restore', requirePermission(PERMISSIONS.PRODUCT_MANAGE), productController.restore);

module.exports = router;
