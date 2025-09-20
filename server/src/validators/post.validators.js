const { z } = require('zod');

const baseSchema = {
  title: z.string().min(2),
  slug: z.string().min(2).optional(),
  content: z.string().optional(),
  coverImage: z
    .object({
      url: z.string().url(),
      mediaId: z.string().length(24).optional()
    })
    .optional(),
  categoryId: z.string().length(24).optional(),
  tagIds: z.array(z.string().length(24)).optional(),
  status: z.enum(['draft', 'review', 'published']).optional(),
  scheduledAt: z.string().datetime().optional()
};

const createPostSchema = z.object(baseSchema);

const updatePostSchema = z.object({
  title: baseSchema.title.optional(),
  slug: baseSchema.slug,
  content: baseSchema.content,
  coverImage: baseSchema.coverImage,
  categoryId: baseSchema.categoryId,
  tagIds: baseSchema.tagIds,
  status: baseSchema.status,
  scheduledAt: baseSchema.scheduledAt
});

const postSubmissionSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long'),
  content: z.string().min(10, 'Share a bit more detail before submitting'),
  categoryId: z.string().length(24).optional(),
  coverImage: z
    .object({
      url: z.string().url('Cover image must be a valid URL'),
      mediaId: z.string().length(24).optional()
    })
    .optional(),
  tagIds: z.array(z.string().length(24)).optional()
});

const updateUserSubmissionSchema = postSubmissionSchema;

module.exports = {
  createPostSchema,
  updatePostSchema,
  postSubmissionSchema,
  updateUserSubmissionSchema
};
