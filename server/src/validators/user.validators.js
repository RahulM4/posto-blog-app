const { z } = require('zod');

const roleEnum = z.enum(['SuperAdmin', 'Admin', 'Moderator', 'User']);
const statusEnum = z.enum(['active', 'inactive', 'pending']);
const approvalStatusEnum = z.enum(['pending', 'approved', 'rejected']);

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: roleEnum
});

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: roleEnum.optional(),
  status: statusEnum.optional(),
  avatarUrl: z.string().url().optional()
});

const statusSchema = z.object({
  status: statusEnum
});

const bulkStatusSchema = z.object({
  ids: z.array(z.string().length(24)),
  status: statusEnum
});

const approvalSchema = z.object({
  approvalStatus: approvalStatusEnum,
  note: z.string().max(500).optional()
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  statusSchema,
  bulkStatusSchema,
  approvalSchema
};
