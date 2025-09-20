const express = require('express');
const publicController = require('../controllers/public.controller');

const router = express.Router();

router.get('/products', publicController.listPublicProducts);
router.get('/products/:slug', publicController.getPublicProduct);
router.get('/posts', publicController.listPublicPosts);
router.get('/posts/:slug', publicController.getPublicPost);
router.get('/categories', publicController.listPublicCategories);

module.exports = router;
