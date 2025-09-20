const express = require('express');
const multer = require('multer');
const { requireAuth, requirePermission } = require('../middleware/auth');
const mediaController = require('../controllers/media.controller');
const { PERMISSIONS } = require('../config/rbac');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const router = express.Router();

router.use(requireAuth, requirePermission(PERMISSIONS.MEDIA_MANAGE));

router.get('/', mediaController.list);
router.post('/', upload.single('file'), mediaController.upload);
router.delete('/:mediaId', mediaController.remove);

module.exports = router;
