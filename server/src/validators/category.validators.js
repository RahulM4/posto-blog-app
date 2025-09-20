const { z } = require('zod');

const base = {
  name: z.string().min(2),
  slug: z.string().min(2).optional(),
  type: z.enum(['product', 'post'])
};

const createCategorySchema = z.object(base);
const updateCategorySchema = z.object({
  name: base.name.optional(),
  slug: base.slug,
  type: base.type.optional()
});

module.exports = {
  createCategorySchema,
  updateCategorySchema
};
