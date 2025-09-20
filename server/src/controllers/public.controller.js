const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const Product = require('../models/product.model');
const Post = require('../models/post.model');
const Category = require('../models/category.model');
const { buildPagination, buildSorting } = require('../utils/pagination');

const listPublicProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const sort = buildSorting(req.query.sort || 'createdAt:desc');
  const search = req.query.q;
  const categoryId = req.query.categoryId || req.query.category;
  const query = {
    status: 'published',
    visibility: 'visible',
    deletedAt: null
  };
  if (search) {
    query.$text = { $search: search };
  }
  if (categoryId) {
    query.categoryId = categoryId;
  }
  const [items, total] = await Promise.all([
    Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('title slug price images createdAt categoryId')
      .populate('categoryId', 'name slug')
      .lean(),
    Product.countDocuments(query)
  ]);
  success(res, 200, items, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  });
});

const getPublicProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, status: 'published', visibility: 'visible', deletedAt: null })
    .select('-deletedAt')
    .populate('categoryId', 'name slug')
    .populate('tagIds', 'name slug')
    .lean();
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  success(res, 200, { product });
});

const listPublicPosts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const sort = buildSorting(req.query.sort || 'publishedAt:desc');
  const search = req.query.q;
  const categoryId = req.query.categoryId || req.query.category;
  const query = {
    status: 'published',
    deletedAt: null
  };
  if (search) {
    query.$text = { $search: search };
  }
  if (categoryId) {
    query.categoryId = categoryId;
  }
  const [items, total] = await Promise.all([
    Post.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('title slug coverImage publishedAt createdAt categoryId')
      .populate('categoryId', 'name slug')
      .lean(),
    Post.countDocuments(query)
  ]);
  success(res, 200, items, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  });
});

const getPublicPost = asyncHandler(async (req, res) => {
  const post = await Post.findOne({ slug: req.params.slug, status: 'published', deletedAt: null })
    .select('-deletedAt')
    .populate('categoryId', 'name slug')
    .populate('tagIds', 'name slug')
    .populate('authorId', 'name')
    .lean();
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }
  success(res, 200, { post });
});

const listPublicCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ type: req.query.type }).sort({ name: 1 }).lean();
  success(res, 200, { categories });
});

module.exports = {
  listPublicProducts,
  getPublicProduct,
  listPublicPosts,
  getPublicPost,
  listPublicCategories
};
