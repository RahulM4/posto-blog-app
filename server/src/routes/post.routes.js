const express = require('express');
const validate = require('../middleware/validate');
const { requireAuth, requirePermission } = require('../middleware/auth');
const postController = require('../controllers/post.controller');
const {
  createPostSchema,
  updatePostSchema,
  postSubmissionSchema,
  updateUserSubmissionSchema
} = require('../validators/post.validators');
const { PERMISSIONS } = require('../config/rbac');

const router = express.Router();

router.use(requireAuth);

router.post('/user-submissions', validate(postSubmissionSchema), postController.submitAsUser);
router.patch('/user-submissions/:postId', validate(updateUserSubmissionSchema), postController.updateUserSubmission);
router.get('/user-submissions/:postId', postController.getUserSubmission);

router.get('/mine', postController.listMine);

router.get('/', requirePermission(PERMISSIONS.POST_VIEW), postController.list);
router.post('/', requirePermission(PERMISSIONS.POST_MANAGE), validate(createPostSchema), postController.create);
router.get('/:postIdOrSlug', requirePermission(PERMISSIONS.POST_VIEW), postController.get);
router.patch('/:postId', requirePermission(PERMISSIONS.POST_MANAGE), validate(updatePostSchema), postController.update);
router.post('/:postId/submit', requirePermission(PERMISSIONS.POST_MANAGE), postController.submitForReview);
router.post('/:postId/approve', requirePermission(PERMISSIONS.POST_APPROVE), postController.approve);
router.delete('/:postId', requirePermission(PERMISSIONS.POST_MANAGE), postController.softDelete);

module.exports = router;
