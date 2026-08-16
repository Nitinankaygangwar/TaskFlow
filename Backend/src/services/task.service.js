const prisma = require('../config/db');
const { ApiError } = require('../utils/errors');
const { normalizePagination, buildPaginatedResponse } = require('../utils/pagination');
const { emailQueue } = require('../queue/email.queue');
const { redis } = require('../config/redis');
const crypto = require('crypto');

function validateAssignmentInput(data) {
  return {
    valid: !!(data && typeof data.userId === 'string' && data.userId.trim().length > 0),
    message: 'Invalid assignee',
  };
}

function normalizeDueDate(value) {
  if (!value) return null;
  if (typeof value !== 'string') return value;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00.000Z`);
  }
  return new Date(value);
}

function isValidAssignmentTarget({ targetOrganizationId, currentOrganizationId }) {
  return targetOrganizationId === currentOrganizationId;
}

async function createTask(organizationId, projectId, userId, data) {
  const project = await prisma.project.findFirst({ where: { id: projectId, organizationId } });
  if (!project) {
    throw new ApiError('Project not found', 'PROJECT_NOT_FOUND', 404);
  }

  return prisma.task.create({
    data: {
      title: data.title,
      description: data.description || null,
      status: data.status || 'todo',
      priority: data.priority || 'medium',
      dueDate: normalizeDueDate(data.dueDate),
      projectId,
      organizationId,
      createdBy: userId,
    },
  });
}

async function listTasks(organizationId, projectId, query = {}) {
  const pagination = normalizePagination({ page: query.page, limit: query.limit });
  const where = { organizationId, projectId };

  if (query.status) where.status = query.status;
  if (query.priority) where.priority = query.priority;
  if (query.assignee) where.assignments = { some: { userId: query.assignee } };
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
    ];
  }
  if (query.dueDateFrom || query.dueDateTo) {
    where.dueDate = {
      ...(query.dueDateFrom ? { gte: normalizeDueDate(query.dueDateFrom) } : {}),
      ...(query.dueDateTo ? { lte: normalizeDueDate(query.dueDateTo) } : {}),
    };
  }

  const [items, total] = await Promise.all([
    prisma.task.findMany({
      where,
      include: { assignments: true },
      orderBy: { createdAt: 'desc' },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
    }),
    prisma.task.count({ where }),
  ]);

  return buildPaginatedResponse(items, total, pagination.page, pagination.limit);
}

async function getTask(organizationId, taskId) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, organizationId },
    include: { assignments: true },
  });

  if (!task) {
    throw new ApiError('Task not found', 'TASK_NOT_FOUND', 404);
  }

  return task;
}

async function updateTask(organizationId, taskId, data) {
  const task = await getTask(organizationId, taskId);
  return prisma.task.update({
    where: { id: task.id },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.description !== undefined ? { description: data.description || null } : {}),
      ...(data.status ? { status: data.status } : {}),
      ...(data.priority ? { priority: data.priority } : {}),
      ...(data.dueDate !== undefined ? { dueDate: normalizeDueDate(data.dueDate) } : {}),
    },
  });
}

async function deleteTask(organizationId, taskId) {
  const task = await getTask(organizationId, taskId);
  await prisma.task.delete({ where: { id: task.id } });
  return { deleted: true };
}

async function assignTask(organizationId, taskId, userId, assigneeId) {
  const validation = validateAssignmentInput({ userId: assigneeId });
  if (!validation.valid) {
    throw new ApiError('Invalid assignee', 'INVALID_ASSIGNEE', 422);
  }

  const task = await getTask(organizationId, taskId);
  const targetMembership = await prisma.orgMember.findFirst({
    where: { userId: assigneeId, organizationId },
  });
  if (!targetMembership) {
    throw new ApiError('Invalid assignee', 'INVALID_ASSIGNEE', 422);
  }

  try {
    const assignment = await prisma.taskAssignment.create({
      data: { taskId: task.id, userId: assigneeId },
    });

    const dedupeKey = `task-assignment:${task.id}:${assigneeId}`;
    const gotLock = await redis.set(dedupeKey, '1', 'EX', 5, 'NX');
    if (gotLock) {
      const payload = {
        type: 'TASK_ASSIGNED',
        taskId: task.id,
        userId: assigneeId,
        organizationId,
      };
      const jobId = crypto.createHash('sha256').update(`${task.id}:${assigneeId}:${Date.now()}`).digest('hex');
      await emailQueue.add('TASK_ASSIGNED', payload, {
        jobId,
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      });
    }

    return assignment;
  } catch (error) {
    if (error.code === 'P2002') {
      throw new ApiError('Task already assigned to user', 'INVALID_ASSIGNEE', 409);
    }
    throw error;
  }
}

async function unassignTask(organizationId, taskId, userId) {
  const task = await getTask(organizationId, taskId);
  const assignment = await prisma.taskAssignment.findFirst({
    where: { taskId: task.id, userId },
  });
  if (!assignment) {
    throw new ApiError('Task not found', 'TASK_NOT_FOUND', 404);
  }

  await prisma.taskAssignment.delete({ where: { id: assignment.id } });
  return { unassigned: true };
}

async function getProjectDashboard(organizationId, projectId) {
  const project = await prisma.project.findFirst({ where: { id: projectId, organizationId } });
  if (!project) {
    throw new ApiError('Project not found', 'PROJECT_NOT_FOUND', 404);
  }

  const counts = await prisma.task.groupBy({
    by: ['status'],
    where: { organizationId, projectId },
    _count: { _all: true },
  });

  const result = { todo: 0, in_progress: 0, review: 0, done: 0 };
  for (const row of counts) {
    result[row.status] = row._count._all;
  }

  return { data: result };
}

async function bulkUpdateTaskStatus(organizationId, taskIds, status) {
  if (!Array.isArray(taskIds) || taskIds.length === 0) {
    throw new ApiError('Task IDs are required', 'INVALID_TASK_IDS', 422);
  }

  const tasks = await prisma.task.findMany({
    where: { id: { in: taskIds }, organizationId },
    select: { id: true },
  });

  if (tasks.length !== taskIds.length) {
    throw new ApiError('One or more tasks were not found in this organization', 'TASK_NOT_FOUND', 404);
  }

  await prisma.task.updateMany({
    where: { id: { in: taskIds }, organizationId },
    data: { status },
  });

  return { updated: tasks.length, status };
}

module.exports = {
  validateAssignmentInput,
  isValidAssignmentTarget,
  createTask,
  listTasks,
  getTask,
  updateTask,
  deleteTask,
  assignTask,
  unassignTask,
  getProjectDashboard,
  bulkUpdateTaskStatus,
};
