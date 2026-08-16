const { z } = require('zod');

const registrationSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
  organizationName: z.string().trim().min(1).max(150),
  role: z.enum(['platform_admin', 'org_admin', 'member']).optional().default('org_admin'),
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(10),
});

module.exports = { registrationSchema, loginSchema, refreshSchema };
