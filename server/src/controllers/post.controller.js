const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const postService = require('../services/post.service');

const list = asyncHandler(async (req, res) => {
  const result = await postService.listPosts(req.query);
  success(res, 200, result.items, result.meta);
});

const get = asyncHandler(async (req, res) => {
  const post = await postService.getPost(req.params.postIdOrSlug);
  success(res, 200, { post });
});

const create = asyncHandler(async (req, res) => {
  const post = await postService.createPost(req.body, req.auth);
  success(res, 201, { post });
});

const update = asyncHandler(async (req, res) => {
  const post = await postService.updatePost(req.params.postId, req.body, req.auth);
  success(res, 200, { post });
});

const submitForReview = asyncHandler(async (req, res) => {
  const post = await postService.submitForReview(req.params.postId, req.auth);
  success(res, 200, { post });
});

const approve = asyncHandler(async (req, res) => {
  const post = await postService.approvePost(req.params.postId, req.auth);
  success(res, 200, { post });
});

const submitAsUser = asyncHandler(async (req, res) => {
  const post = await postService.createUserSubmission(req.body, req.auth);
  success(res, 201, { post });
});

const updateUserSubmission = asyncHandler(async (req, res) => {
  const post = await postService.updateUserSubmission(req.params.postId, req.body, req.auth);
  success(res, 200, { post });
});

const getUserSubmission = asyncHandler(async (req, res) => {
  const post = await postService.getUserSubmission(req.params.postId, req.auth);
  success(res, 200, { post });
});

const listMine = asyncHandler(async (req, res) => {
  const result = await postService.listPosts({ ...req.query, mineOnly: true }, req.auth);
  success(res, 200, result.items, result.meta);
});

const softDelete = asyncHandler(async (req, res) => {
  await postService.softDelete(req.params.postId, req.auth);
  success(res, 200, { message: 'Post moved to trash' });
});

module.exports = {
  list,
  get,
  create,
  update,
  submitForReview,
  approve,
  submitAsUser,
  updateUserSubmission,
  getUserSubmission,
  listMine,
  softDelete
};
