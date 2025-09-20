const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const userService = require('../services/user.service');

const list = asyncHandler(async (req, res) => {
  const result = await userService.listUsers(req.query);
  success(res, 200, result.items, result.meta);
});

const get = asyncHandler(async (req, res) => {
  const user = await userService.getUser(req.params.userId);
  success(res, 200, { user });
});

const create = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body, req.auth);
  success(res, 201, { user });
});

const update = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.userId, req.body, req.auth);
  success(res, 200, { user });
});

const setStatus = asyncHandler(async (req, res) => {
  const user = await userService.setStatus(req.params.userId, req.body.status, req.auth);
  success(res, 200, { user });
});

const setApproval = asyncHandler(async (req, res) => {
  const user = await userService.setApprovalStatus(
    req.params.userId,
    req.body.approvalStatus,
    req.auth,
    req.body.note
  );
  success(res, 200, { user });
});

const softDelete = asyncHandler(async (req, res) => {
  await userService.softDelete(req.params.userId, req.auth);
  success(res, 200, { message: 'User deactivated' });
});

const restore = asyncHandler(async (req, res) => {
  const user = await userService.restore(req.params.userId, req.auth);
  success(res, 200, { user });
});

const hardDelete = asyncHandler(async (req, res) => {
  await userService.hardDelete(req.params.userId, req.auth);
  success(res, 200, { message: 'User deleted' });
});

const bulkStatus = asyncHandler(async (req, res) => {
  await userService.bulkStatus(req.body, req.auth);
  success(res, 200, { message: 'Users updated' });
});

module.exports = {
  list,
  get,
  create,
  update,
  setStatus,
  setApproval,
  softDelete,
  restore,
  hardDelete,
  bulkStatus
};
