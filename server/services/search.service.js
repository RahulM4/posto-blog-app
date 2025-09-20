const Product = require('../models/product.model');
const Post = require('../models/post.model');
const { buildPagination } = require('../utils/pagination');

const globalSearch = async (term, filters = {}) => {
  if (!term) {
    return { items: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } };
  }
  const { page, limit, skip } = buildPagination(filters);
  const [products, posts, productCount, postCount] = await Promise.all([
    Product.find({ $text: { $search: term }, deletedAt: null, status: 'published', visibility: 'visible' })
      .select('title slug price createdAt')
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit)
      .lean(),
    Post.find({ $text: { $search: term }, deletedAt: null, status: 'published' })
      .select('title slug publishedAt createdAt')
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments({ $text: { $search: term }, deletedAt: null, status: 'published', visibility: 'visible' }),
    Post.countDocuments({ $text: { $search: term }, deletedAt: null, status: 'published' })
  ]);
  const items = [
    ...products.map((product) => ({ type: 'product', ...product })),
    ...posts.map((post) => ({ type: 'post', ...post }))
  ];
  const total = productCount + postCount;
  return {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

module.exports = {
  globalSearch
};
