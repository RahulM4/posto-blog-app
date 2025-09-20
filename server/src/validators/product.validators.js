const { z } = require('zod');

const imageSchema = z.object({
  url: z.string().url(),
  mediaId: z.string().length(24).optional()
});

const baseSchema = {
  title: z.string().min(2),
  slug: z.string().min(2).optional(),
  description: z.string().optional(),
  images: z.array(imageSchema).optional(),
  price: z.number().nonnegative(),
  stock: z.number().int().nonnegative().optional(),
  categoryId: z.string().length(24).optional(),
  tagIds: z.array(z.string().length(24)).optional(),
  status: z.enum(['draft', 'published']).optional(),
  visibility: z.enum(['visible', 'hidden']).optional()
};

const createProductSchema = z.object(baseSchema);

const updateProductSchema = z.object({
  title: baseSchema.title.optional(),
  slug: baseSchema.slug,
  description: baseSchema.description,
  images: baseSchema.images,
  price: baseSchema.price.optional(),
  stock: baseSchema.stock,
  categoryId: baseSchema.categoryId,
  tagIds: baseSchema.tagIds,
  status: baseSchema.status,
  visibility: baseSchema.visibility
});

module.exports = {
  createProductSchema,
  updateProductSchema
};
