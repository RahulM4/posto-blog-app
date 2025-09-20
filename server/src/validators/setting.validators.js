const { z } = require('zod');

const updateSettingsSchema = z
  .object({
    app: z
      .object({
        name: z.string().min(2),
        logo: z.string().url().nullable()
      })
      .partial()
      .optional(),
    email: z
      .object({
        welcomeTemplate: z.string().min(3),
        resetTemplate: z.string().min(3)
      })
      .partial()
      .optional(),
    features: z
      .object({
        allowRegistration: z.boolean()
      })
      .partial()
      .optional()
  })
  .partial();

module.exports = {
  updateSettingsSchema
};
