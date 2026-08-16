const { z } = require('zod');

const statusEnum = ['todo', 'in_progress', 'review', 'done'];
const priorityEnum = ['low', 'medium', 'high', 'urgent'];
const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;

const dueDateValue = z.union([
  z.string().datetime({ local: false }),
  z.string().regex(dateOnlyPattern),
]);

const taskSchema = z.object({
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().max(10000).optional().or(z.literal('')),
  status: z.enum(statusEnum).optional(),
  priority: z.enum(priorityEnum).optional(),
  dueDate: dueDateValue.optional().or(z.literal('')),
});

const taskUpdateSchema = taskSchema.partial();

const taskFilterSchema = z.object({
  status: z.enum(statusEnum).optional(),
  priority: z.enum(priorityEnum).optional(),
  assignee: z.string().uuid().optional(),
  dueDateFrom: dueDateValue.optional(),
  dueDateTo: dueDateValue.optional(),
  search: z.string().trim().min(1).max(200).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

const assignmentSchema = z.object({ userId: z.string().uuid() });

const bulkTaskStatusSchema = z.object({
  taskIds: z.array(z.string().uuid()).min(1),
  status: z.enum(statusEnum),
});

module.exports = { taskSchema, taskUpdateSchema, taskFilterSchema, assignmentSchema, bulkTaskStatusSchema };
