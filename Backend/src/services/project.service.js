const prisma = require('../config/db');
const { ApiError } = require('../utils/errors');
const { normalizePagination, buildPaginatedResponse } = require('../utils/pagination');

async function createProject(organizationId, userId, data) {
  return prisma.project.create({
    data: {
      organizationId,
      createdBy: userId,
      name: data.name,
      description: data.description || null,
    },
  });
}

async function listProjects(organizationId, query = {}) {
  if (!organizationId) {
    throw new ApiError('Organization context required', 'FORBIDDEN', 403);
  }

  const pagination = normalizePagination({ page: query.page, limit: query.limit });
  const [items, total] = await Promise.all([
    prisma.project.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
    }),
    prisma.project.count({ where: { organizationId } }),
  ]);

  return buildPaginatedResponse(items, total, pagination.page, pagination.limit);
}

async function getProject(organizationId, projectId) {
  if (!organizationId) {
    throw new ApiError('Organization context required', 'FORBIDDEN', 403);
  }

  const project = await prisma.project.findFirst({
    where: { id: projectId, organizationId },
  });

  if (!project) {
    throw new ApiError('Project not found', 'PROJECT_NOT_FOUND', 404);
  }

  return project;
}

async function updateProject(organizationId, projectId, data) {
  const project = await getProject(organizationId, projectId);
  return prisma.project.update({
    where: { id: project.id },
    data,
  });
}

async function deleteProject(organizationId, projectId) {
  const project = await getProject(organizationId, projectId);
  await prisma.project.delete({ where: { id: project.id } });
  return { deleted: true };
}

module.exports = { createProject, listProjects, getProject, updateProject, deleteProject };
