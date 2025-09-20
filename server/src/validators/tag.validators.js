const { z } = require('zod');

const base = {
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  type: z.enum(['product', 'post'])
};

const createTagSchema = z.object(base);
const updateTagSchema = z.object({
  name: base.name.optional(),
  slug: base.slug,
  type: base.type.optional()
});

module.exports = {
  createTagSchema,
  updateTagSchema
};
