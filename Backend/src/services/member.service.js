const prisma = require('../config/db');
const { ApiError } = require('../utils/errors');

async function listMembers(organizationId) {
  if (!organizationId) {
    throw new ApiError('Organization context required', 'FORBIDDEN', 403);
  }

  const members = await prisma.orgMember.findMany({
    where: { organizationId },
    orderBy: { joinedAt: 'asc' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return { data: members.map((member) => ({
    id: member.id,
    userId: member.userId,
    role: member.role,
    joinedAt: member.joinedAt,
    user: member.user,
    organizationId: member.organizationId,
  })) };
}

async function addMember(organizationId, email) {
  if (!organizationId) {
    throw new ApiError('Organization context required', 'FORBIDDEN', 403);
  }

  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail) {
    throw new ApiError('Member email is required', 'INVALID_MEMBER', 422);
  }

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) {
    throw new ApiError('User not found', 'USER_NOT_FOUND', 404);
  }

  const existingMembership = await prisma.orgMember.findFirst({
    where: { organizationId, userId: user.id },
  });

  if (existingMembership) {
    throw new ApiError('User is already a member of this organization', 'INVALID_MEMBER', 409);
  }

  const member = await prisma.orgMember.create({
    data: { organizationId, userId: user.id, role: 'member' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return {
    id: member.id,
    userId: member.userId,
    role: member.role,
    joinedAt: member.joinedAt,
    user: member.user,
    organizationId: member.organizationId,
  };
}

async function updateMemberRole(organizationId, memberId, role) {
  if (!organizationId) {
    throw new ApiError('Organization context required', 'FORBIDDEN', 403);
  }

  const member = await prisma.orgMember.findFirst({
    where: { id: memberId, organizationId },
  });

  if (!member) {
    throw new ApiError('Member not found', 'MEMBER_NOT_FOUND', 404);
  }

  if (role !== 'org_admin' && role !== 'member') {
    throw new ApiError('Invalid role', 'INVALID_ROLE', 422);
  }

  const adminCount = await prisma.orgMember.count({
    where: { organizationId, role: 'org_admin' },
  });

  if (member.role === 'org_admin' && role === 'member' && adminCount <= 1) {
    throw new ApiError('At least one organization admin is required', 'INVALID_ROLE', 409);
  }

  const updated = await prisma.orgMember.update({
    where: { id: member.id },
    data: { role },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return {
    id: updated.id,
    userId: updated.userId,
    role: updated.role,
    joinedAt: updated.joinedAt,
    user: updated.user,
    organizationId: updated.organizationId,
  };
}

async function removeMember(organizationId, memberId) {
  if (!organizationId) {
    throw new ApiError('Organization context required', 'FORBIDDEN', 403);
  }

  const member = await prisma.orgMember.findFirst({
    where: { id: memberId, organizationId },
  });

  if (!member) {
    throw new ApiError('Member not found', 'MEMBER_NOT_FOUND', 404);
  }

  if (member.role === 'org_admin') {
    const adminCount = await prisma.orgMember.count({
      where: { organizationId, role: 'org_admin' },
    });

    if (adminCount <= 1) {
      throw new ApiError('Cannot remove the last organization admin', 'INVALID_MEMBER', 409);
    }
  }

  await prisma.orgMember.delete({ where: { id: member.id } });
  return { deleted: true };
}

module.exports = { listMembers, addMember, updateMemberRole, removeMember };
