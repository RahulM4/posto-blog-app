const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const mediaService = require('../services/media.service');

const list = asyncHandler(async (req, res) => {
  const result = await mediaService.listMedia(req.query);
  success(res, 200, result.items, result.meta);
});

const upload = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new Error('File missing');
  }
  const media = await mediaService.storeMedia(req.file, req.auth);
  success(res, 201, { media });
});

const remove = asyncHandler(async (req, res) => {
  await mediaService.removeMedia(req.params.mediaId, req.auth);
  success(res, 200, { message: 'Media deleted' });
});

module.exports = {
  list,
  upload,
  remove
};
