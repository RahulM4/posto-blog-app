const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const productRoutes = require('./product.routes');
const postRoutes = require('./post.routes');
const mediaRoutes = require('./media.routes');
const categoryRoutes = require('./category.routes');
const tagRoutes = require('./tag.routes');
const auditRoutes = require('./audit.routes');
const settingRoutes = require('./setting.routes');
const searchRoutes = require('./search.routes');
const publicRoutes = require('./public.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/posts', postRoutes);
router.use('/media', mediaRoutes);
router.use('/categories', categoryRoutes);
router.use('/tags', tagRoutes);
router.use('/audit-logs', auditRoutes);
router.use('/settings', settingRoutes);
router.use('/search', searchRoutes);
router.use('/public', publicRoutes);

module.exports = router;
