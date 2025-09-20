const createError = require('http-errors');
const sanitizeHtml = require('sanitize-html');
const dayjs = require('dayjs');
const Post = require('../models/post.model');
const auditService = require('./audit.service');
const { buildPagination, buildSorting } = require('../utils/pagination');

const sanitizeContent = (html) =>
  sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'figure', 'figcaption']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt', 'title', 'width', 'height']
    }
  });

const listPosts = async (filters = {}, actor = null) => {
  const { status, categoryId, tagId, authorId, search, includeDeleted, mineOnly } = filters;
  const query = {};
  if (status) query.status = status;
  if (categoryId) query.categoryId = categoryId;
  if (tagId) query.tagIds = tagId;
  if (authorId) query.authorId = authorId;
  if (mineOnly && actor?.id) query.authorId = actor.id;
  if (!includeDeleted) query.deletedAt = null;
  if (search) query.$text = { $search: search };
  const { page, limit, skip } = buildPagination(filters);
  const sort = buildSorting(filters.sort || ['scheduledAt:asc', 'createdAt:desc']);
  const [items, total] = await Promise.all([
    Post.find(query)
      .populate('categoryId', 'name slug')
      .populate('tagIds', 'name slug')
      .populate('authorId', 'name email')
      .populate('approvedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Post.countDocuments(query)
  ]);
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

const findUserPost = async (id, actor) => {
  const resolvedActor = ensureActor(actor);
  const post = await Post.findOne({ _id: id, authorId: resolvedActor.id, deletedAt: null })
    .populate('categoryId', 'name slug')
    .populate('tagIds', 'name slug')
    .populate('authorId', 'name email')
    .populate('approvedBy', 'name email');
  if (!post) {
    throw createError(404, 'Post not found');
  }
  return post;
};

const getPost = async (idOrSlug) => {
  const query = idOrSlug.match(/^[0-9a-fA-F]{24}$/) ? { _id: idOrSlug } : { slug: idOrSlug };
  const post = await Post.findOne(query)
    .populate('categoryId', 'name slug')
    .populate('tagIds', 'name slug')
    .populate('authorId', 'name email')
    .populate('approvedBy', 'name email')
    .lean();
  if (!post || post.deletedAt) {
    throw createError(404, 'Post not found');
  }
  return post;
};

const ensureActor = (actor) => {
  if (!actor?.id) {
    throw createError(401, 'Authentication required');
  }
  return actor;
};

const createPost = async (payload, actor) => {
  const resolvedActor = ensureActor(actor);
  const post = await Post.create({
    ...payload,
    guestAuthor: undefined,
    content: sanitizeContent(payload.content || ''),
    authorId: resolvedActor.id
  });
  await auditService.log({
    actorId: resolvedActor.id,
    action: 'post.create',
    entityType: 'Post',
    entityId: post.id
  });
  return post.toJSON();
};

const createUserSubmission = async (payload, actor) => {
  const resolvedActor = ensureActor(actor);
  const post = await Post.create({
    title: payload.title,
    content: sanitizeContent(payload.content || ''),
    coverImage: payload.coverImage,
    categoryId: payload.categoryId,
    tagIds: payload.tagIds || [],
    status: 'review',
    authorId: resolvedActor.id
  });

  await auditService.log({
    actorId: resolvedActor.id,
    action: 'post.user_submit',
    entityType: 'Post',
    entityId: post.id
  });

  return post.toJSON();
};

const updatePost = async (id, updates, actor) => {
  const post = await Post.findById(id);
  if (!post || post.deletedAt) throw createError(404, 'Post not found');
  if (updates.content) {
    updates.content = sanitizeContent(updates.content);
  }
  Object.assign(post, updates);
  if (post.status === 'published' && !post.publishedAt) {
    post.publishedAt = new Date();
  }
  await post.save();
  await auditService.log({
    actorId: actor.id,
    action: 'post.update',
    entityType: 'Post',
    entityId: post.id,
    meta: { status: post.status }
  });
  return post.toJSON();
};

const getUserSubmission = async (id, actor) => {
  const post = await findUserPost(id, actor);
  return post.toJSON();
};

const updateUserSubmission = async (id, payload, actor) => {
  const post = await findUserPost(id, actor);
  post.title = payload.title;
  post.content = sanitizeContent(payload.content || '');
  if (Object.prototype.hasOwnProperty.call(payload, 'categoryId')) {
    post.categoryId = payload.categoryId || undefined;
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'coverImage')) {
    post.coverImage = payload.coverImage === null ? undefined : payload.coverImage;
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'tagIds')) {
    post.tagIds = payload.tagIds || [];
  }
  post.status = 'review';
  post.approvedBy = null;
  post.publishedAt = null;
  await post.save();
  await auditService.log({
    actorId: actor.id,
    action: 'post.user_update',
    entityType: 'Post',
    entityId: post.id
  });
  return post.toJSON();
};

const submitForReview = async (id, actor) => {
  const post = await Post.findById(id);
  if (!post || post.deletedAt) throw createError(404, 'Post not found');
  post.status = 'review';
  await post.save();
  await auditService.log({
    actorId: actor.id,
    action: 'post.submit_review',
    entityType: 'Post',
    entityId: post.id
  });
  return post.toJSON();
};

const approvePost = async (id, actor) => {
  const post = await Post.findById(id);
  if (!post || post.deletedAt) throw createError(404, 'Post not found');
  post.status = 'published';
  post.approvedBy = actor.id;
  post.publishedAt = post.scheduledAt && dayjs(post.scheduledAt).isAfter(dayjs()) ? post.scheduledAt : new Date();
  await post.save();
  await auditService.log({
    actorId: actor.id,
    action: 'post.approve',
    entityType: 'Post',
    entityId: post.id
  });
  return post.toJSON();
};

const softDelete = async (id, actor) => {
  const post = await Post.findById(id);
  if (!post || post.deletedAt) throw createError(404, 'Post not found');
  post.deletedAt = new Date();
  await post.save();
  await auditService.log({
    actorId: actor.id,
    action: 'post.soft_delete',
    entityType: 'Post',
    entityId: post.id
  });
  return true;
};

module.exports = {
  listPosts,
  getPost,
  getUserSubmission,
  createPost,
  createUserSubmission,
  updatePost,
  updateUserSubmission,
  submitForReview,
  approvePost,
  softDelete
};
