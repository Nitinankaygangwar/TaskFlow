const prisma = require('../config/db');
const { ApiError } = require('../utils/errors');
const { getPaginationMeta } = require('../utils/pagination');

/**
 * Platform Admin Dashboard - Statistics and overview
 */
async function getPlatformDashboard(req, res) {
  const totalUsers = await prisma.user.count();
  const totalOrganizations = await prisma.organization.count();
  const totalProjects = await prisma.project.count();
  const totalTasks = await prisma.task.count();
  
  const platformAdmins = await prisma.user.count({
    where: { platformRole: 'platform_admin' },
  });

  res.json({
    totalUsers,
    totalOrganizations,
    totalProjects,
    totalTasks,
    platformAdmins,
    timestamp: new Date(),
  });
}

/**
 * List all organizations (paginated)
 */
async function listOrganizations(req, res) {
  const { page = 1, limit = 10, search = '' } = req.query;
  const { skip, take } = getPaginationMeta({ page, limit });

  const where = search
    ? { name: { contains: search, mode: 'insensitive' } }
    : {};

  const [organizations, total] = await Promise.all([
    prisma.organization.findMany({
      where,
      skip,
      take,
      select: {
        id: true,
        name: true,
        createdAt: true,
        members: { select: { id: true }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.organization.count({ where }),
  ]);

  const data = organizations.map((org) => ({
    id: org.id,
    name: org.name,
    memberCount: org.members.length,
    createdAt: org.createdAt,
  }));

  res.json({
    data,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

/**
 * Get organization details
 */
async function getOrganization(req, res) {
  const { organizationId } = req.params;

  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      members: {
        include: {
          user: { select: { id: true, email: true, name: true } },
        },
      },
      projects: { select: { id: true, name: true } },
    },
  });

  if (!organization) {
    throw new ApiError('Organization not found', 'NOT_FOUND', 404);
  }

  res.json({
    id: organization.id,
    name: organization.name,
    createdAt: organization.createdAt,
    memberCount: organization.members.length,
    projectCount: organization.projects.length,
    members: organization.members.map((m) => ({
      id: m.user.id,
      email: m.user.email,
      name: m.user.name,
      role: m.role,
      joinedAt: m.joinedAt,
    })),
  });
}

/**
 * Create a new organization
 */
async function createOrganization(req, res) {
  const { name, adminUserId } = req.body;

  if (!name || !name.trim()) {
    throw new ApiError('Organization name required', 'VALIDATION_ERROR', 400);
  }

  let adminUser = null;
  if (adminUserId) {
    adminUser = await prisma.user.findUnique({
      where: { id: adminUserId },
    });
    if (!adminUser) {
      throw new ApiError('Admin user not found', 'NOT_FOUND', 404);
    }
  }

  return prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: { name: name.trim() },
    });

    if (adminUser) {
      await tx.orgMember.create({
        data: {
          userId: adminUser.id,
          organizationId: organization.id,
          role: 'org_admin',
        },
      });
    }

    res.status(201).json({
      id: organization.id,
      name: organization.name,
      createdAt: organization.createdAt,
      admin: adminUser
        ? { id: adminUser.id, email: adminUser.email, name: adminUser.name }
        : null,
    });
  });
}

/**
 * Update organization
 */
async function updateOrganization(req, res) {
  const { organizationId } = req.params;
  const { name } = req.body;

  if (!name || !name.trim()) {
    throw new ApiError('Organization name required', 'VALIDATION_ERROR', 400);
  }

  const organization = await prisma.organization.update({
    where: { id: organizationId },
    data: { name: name.trim() },
  });

  res.json({
    id: organization.id,
    name: organization.name,
    updatedAt: organization.updatedAt,
  });
}

async function deleteOrganization(req, res) {
  const { organizationId } = req.params;

  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
  });

  if (!organization) {
    throw new ApiError('Organization not found', 'NOT_FOUND', 404);
  }

  await prisma.organization.delete({
    where: { id: organizationId },
  });

  res.status(204).send();
}

/**
 * List all users (paginated)
 */
async function listUsers(req, res) {
  const { page = 1, limit = 10, search = '', role = '' } = req.query;
  const { skip, take } = getPaginationMeta({ page, limit });

  const where = {};
  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (role === 'platform_admin') {
    where.platformRole = 'platform_admin';
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take,
      select: {
        id: true,
        email: true,
        name: true,
        platformRole: true,
        createdAt: true,
        memberships: { select: { id: true }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  const data = users.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    platformRole: user.platformRole,
    organizationCount: user.memberships.length,
    createdAt: user.createdAt,
  }));

  res.json({
    data,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

/**
 * Get user details
 */
async function getUser(req, res) {
  const { userId } = req.params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      platformRole: true,
      createdAt: true,
      memberships: {
        include: { organization: { select: { id: true, name: true } } },
      },
    },
  });

  if (!user) {
    throw new ApiError('User not found', 'NOT_FOUND', 404);
  }

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    platformRole: user.platformRole,
    createdAt: user.createdAt,
    organizations: user.memberships.map((m) => ({
      id: m.organization.id,
      name: m.organization.name,
      role: m.role,
      joinedAt: m.joinedAt,
    })),
  });
}

/**
 * Update user platform role
 */
async function updateUserRole(req, res) {
  const { userId } = req.params;
  const { platformRole } = req.body;

  if (!['user', 'platform_admin'].includes(platformRole)) {
    throw new ApiError('Invalid platform role', 'VALIDATION_ERROR', 400);
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { platformRole },
    select: { id: true, email: true, platformRole: true },
  });

  res.json(user);
}

/**
 * Delete user (revoke all access)
 */
async function deleteUser(req, res) {
  const { userId } = req.params;

  // Revoke all refresh tokens
  await prisma.refreshToken.updateMany({
    where: { userId },
    data: { revokedAt: new Date() },
  });

  // Can delete or soft-delete depending on business logic
  // For now, just revoke tokens
  res.status(204).send();
}

/**
 * Promote user to organization admin
 */
async function promoteToOrgAdmin(req, res) {
  const { userId, organizationId } = req.params;

  const membership = await prisma.orgMember.findFirst({
    where: { userId, organizationId },
  });

  if (!membership) {
    throw new ApiError('User is not a member of this organization', 'NOT_FOUND', 404);
  }

  const updated = await prisma.orgMember.update({
    where: { id: membership.id },
    data: { role: 'org_admin' },
  });

  res.json({ id: updated.id, role: updated.role });
}

/**
 * Assign user to organization
 */
async function assignUserToOrganization(req, res) {
  const { organizationId } = req.params;
  const { userId, role = 'member' } = req.body;

  if (!['org_admin', 'member'].includes(role)) {
    throw new ApiError('Invalid organization role', 'VALIDATION_ERROR', 400);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new ApiError('User not found', 'NOT_FOUND', 404);
  }

  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
  });
  if (!organization) {
    throw new ApiError('Organization not found', 'NOT_FOUND', 404);
  }

  const existing = await prisma.orgMember.findFirst({
    where: { userId, organizationId },
  });
  if (existing) {
    throw new ApiError('User already member of this organization', 'VALIDATION_ERROR', 409);
  }

  const membership = await prisma.orgMember.create({
    data: {
      userId,
      organizationId,
      role,
    },
  });

  res.status(201).json({
    id: membership.id,
    userId: membership.userId,
    organizationId: membership.organizationId,
    role: membership.role,
  });
}

module.exports = {
  getPlatformDashboard,
  listOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  listUsers,
  getUser,
  updateUserRole,
  deleteUser,
  promoteToOrgAdmin,
  assignUserToOrganization,
};
