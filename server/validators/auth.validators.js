const { z } = require('zod');

const nameField = z.string().min(2).max(120);
const emailField = z.string().email().max(255);
const passwordField = z.string().min(8).max(255);

const registerSchema = z.object({
  name: nameField,
  email: emailField,
  password: passwordField,
  role: z.enum(['SuperAdmin', 'Admin', 'Moderator', 'User']).optional()
});

const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1)
});

const requestResetSchema = z.object({
  email: emailField
});

const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: passwordField
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordField
});

const verifyEmailSchema = z.object({
  token: z.string().min(10)
});

const bootstrapAdminSchema = z.object({
  name: nameField,
  email: emailField,
  password: passwordField,
  bootstrapToken: z.string().min(10)
});

module.exports = {
  registerSchema,
  loginSchema,
  requestResetSchema,
  resetPasswordSchema,
  changePasswordSchema,
  verifyEmailSchema,
  bootstrapAdminSchema
};
