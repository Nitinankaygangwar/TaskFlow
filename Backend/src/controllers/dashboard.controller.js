const prisma = require('../config/db');
const { ApiError } = require('../utils/errors');

/**
 * Organization Admin Dashboard
 */
async function getOrgDashboard(req, res) {
  const organizationId = req.user?.organizationId;
  if (!organizationId) {
    throw new ApiError('Organization context required', 'FORBIDDEN', 403);
  }

  const [projectCount, taskCount, memberCount, recentProjects, recentTasks] = await Promise.all([
    prisma.project.count({ where: { organizationId } }),
    prisma.task.count({ where: { organizationId } }),
    prisma.orgMember.count({ where: { organizationId } }),
    prisma.project.findMany({
      where: { organizationId },
      select: { id: true, name: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.task.findMany({
      where: { organizationId },
      select: { id: true, title: true, status: true, priority: true, dueDate: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  res.json({
    projectCount,
    taskCount,
    memberCount,
    recentProjects,
    recentTasks,
  });
}

/**
 * Member Dashboard
 */
async function getMemberDashboard(req, res) {
  const { id: userId, organizationId } = req.user || {};
  if (!organizationId) {
    throw new ApiError('Organization context required', 'FORBIDDEN', 403);
  }

  // Get tasks assigned to this user in the organization
  const assignedTasks = await prisma.task.findMany({
    where: {
      organizationId,
      assignments: { some: { userId } },
    },
    select: {
      id: true,
      title: true,
      status: true,
      priority: true,
      dueDate: true,
      project: { select: { id: true, name: true } },
    },
    orderBy: { dueDate: 'asc' },
    take: 10,
  });

  // Count tasks by status
  const tasksByStatus = await prisma.task.groupBy({
    by: ['status'],
    where: {
      organizationId,
      assignments: { some: { userId } },
    },
    _count: true,
  });

  res.json({
    assignedTasks,
    taskSummary: tasksByStatus.reduce(
      (acc, group) => {
        acc[group.status] = group._count;
        return acc;
      },
      { todo: 0, in_progress: 0, review: 0, done: 0 }
    ),
  });
}

module.exports = {
  getOrgDashboard,
  getMemberDashboard,
};
