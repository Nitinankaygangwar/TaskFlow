const bcrypt = require('bcrypt');
const crypto = require('crypto');
const prisma = require('../config/db');
const { generateAccessToken, generateRefreshToken, verifyToken, getRefreshTokenSecret } = require('../utils/jwt');
const { ApiError } = require('../utils/errors');

const rounds = Number(process.env.BCRYPT_ROUNDS || 12);

async function hashPassword(password) {
  return bcrypt.hash(password, rounds);
}

async function comparePasswords(password, hash) {
  return bcrypt.compare(password, hash);
}

function createAccessToken(userId) {
  return generateAccessToken(userId);
}

function createRefreshToken(userId) {
  return generateRefreshToken(userId);
}

function verifyRefreshToken(token) {
  return verifyToken(token, getRefreshTokenSecret());
}

function isTokenExpired(payload) {
  return typeof payload?.exp === 'number' && Date.now() >= payload.exp * 1000;
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function registerUser({ name, email, password, organizationName, role = 'org_admin' }) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const normalizedRole = ['platform_admin', 'org_admin', 'member'].includes(role) ? role : 'org_admin';

  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existingUser) {
    throw new ApiError('Email already in use', 'EMAIL_IN_USE', 409);
  }

  const passwordHash = await hashPassword(password);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: passwordHash,
      },
    });

    const userWithRole = normalizedRole === 'platform_admin'
      ? await tx.user.update({
          where: { id: user.id },
          data: { platformRole: 'platform_admin' },
        })
      : await tx.user.update({
          where: { id: user.id },
          data: { platformRole: 'user' },
        });

    const organization = await tx.organization.create({
      data: { name: organizationName },
    });

    const membershipRole = normalizedRole === 'platform_admin' ? 'org_admin' : normalizedRole;

    await tx.orgMember.create({
      data: { userId: user.id, organizationId: organization.id, role: membershipRole },
    });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    const refreshHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await tx.refreshToken.create({
      data: {
        userId: user.id,
        organizationId: organization.id,
        tokenHash: refreshHash,
        expiresAt,
      },
    });

    return {
      user: { id: userWithRole.id, email: userWithRole.email, name: userWithRole.name, platformRole: userWithRole.platformRole || 'user' },
      organization: { id: organization.id, name: organization.name },
      organizations: [{ id: organization.id, name: organization.name, role: membershipRole }],
      primaryOrganizationId: organization.id,
      primaryOrganizationRole: membershipRole,
      accessToken,
      refreshToken,
    };
  });
}

async function loginUser({ email, password }) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) {
    throw new ApiError('Invalid email or password', 'INVALID_CREDENTIALS', 401);
  }

  const valid = await comparePasswords(password, user.password);
  if (!valid) {
    throw new ApiError('Invalid email or password', 'INVALID_CREDENTIALS', 401);
  }

  // Load all organizations this user belongs to
  const memberships = await prisma.orgMember.findMany({
    where: { userId: user.id },
    orderBy: { joinedAt: 'asc' },
    include: { organization: true },
  });

  const primaryOrg = memberships[0];
  if (!primaryOrg && user.platformRole !== 'platform_admin') {
    throw new ApiError('Forbidden', 'FORBIDDEN', 403);
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);
  const refreshHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  if (primaryOrg) {
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        organizationId: primaryOrg.organizationId,
        tokenHash: refreshHash,
        expiresAt,
      },
    });
  }

  const organizations = memberships.map((m) => ({
    id: m.organization.id,
    name: m.organization.name,
    role: m.role,
  }));

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      platformRole: user.platformRole,
    },
    organizations,
    primaryOrganizationId: primaryOrg?.organizationId || null,
    primaryOrganizationRole: primaryOrg?.role || null,
    accessToken,
    refreshToken,
  };
}

async function refreshUserToken(oldRefreshToken) {
  let payload;
  try {
    payload = verifyRefreshToken(oldRefreshToken);
  } catch (error) {
    throw new ApiError('Refresh token is invalid', 'REFRESH_TOKEN_INVALID', 401);
  }

  if (isTokenExpired(payload)) {
    throw new ApiError('Refresh token is invalid', 'REFRESH_TOKEN_INVALID', 401);
  }

  const tokenHash = hashToken(oldRefreshToken);
  const existing = await prisma.refreshToken.findFirst({
    where: { tokenHash },
  });

  if (!existing) {
    throw new ApiError('Refresh token is invalid', 'REFRESH_TOKEN_INVALID', 401);
  }
  if (existing.revokedAt || existing.expiresAt < new Date()) {
    throw new ApiError('Refresh token revoked', 'REFRESH_TOKEN_REVOKED', 401);
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) {
    throw new ApiError('Refresh token is invalid', 'REFRESH_TOKEN_INVALID', 401);
  }

  const membership = await prisma.orgMember.findFirst({
    where: { userId: user.id, organizationId: existing.organizationId },
  });
  if (!membership) {
    throw new ApiError('Forbidden', 'FORBIDDEN', 403);
  }

  await prisma.refreshToken.update({
    where: { id: existing.id },
    data: { revokedAt: new Date() },
  });

  const newRefreshToken = generateRefreshToken(user.id);
  const newHash = hashToken(newRefreshToken);
  const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  try {
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        organizationId: existing.organizationId,
        tokenHash: newHash,
        expiresAt: newExpiresAt,
      },
    });
  } catch (error) {
    if (error.code === 'P2002' && error.meta?.target?.includes('tokenHash')) {
      throw new ApiError('Refresh token is invalid', 'REFRESH_TOKEN_INVALID', 401);
    }
    throw error;
  }

  return {
    accessToken: generateAccessToken(user.id),
    refreshToken: newRefreshToken,
    organizationId: existing.organizationId,
    role: membership.role,
  };
}

async function revokeRefreshTokenForUser(userId, refreshToken) {
  const tokenHash = hashToken(refreshToken);
  await prisma.refreshToken.updateMany({
    where: { userId, tokenHash },
    data: { revokedAt: new Date() },
  });
}

async function revokeAllUserSessions(userId) {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

module.exports = {
  hashPassword,
  comparePasswords,
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
  isTokenExpired,
  hashToken,
  registerUser,
  loginUser,
  refreshUserToken,
  revokeRefreshTokenForUser,
  revokeAllUserSessions,
};
