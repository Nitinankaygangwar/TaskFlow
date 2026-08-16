const { z } = require('zod');

const projectSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(10000).optional().or(z.literal('')),
});

const projectUpdateSchema = projectSchema.partial();

module.exports = { projectSchema, projectUpdateSchema };
