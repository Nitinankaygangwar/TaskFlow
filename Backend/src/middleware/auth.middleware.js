const prisma = require('../config/db');
const { verifyToken, getAccessTokenSecret } = require('../utils/jwt');
const { ApiError } = require('../utils/errors');

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      throw new ApiError('Authentication required', 'AUTHENTICATION_REQUIRED', 401);
    }

    const decoded = verifyToken(token, getAccessTokenSecret());
    if (decoded.type !== 'access') {
      throw new ApiError('Authentication required', 'AUTHENTICATION_REQUIRED', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
    });

    if (!user) throw new ApiError('Authentication required', 'AUTHENTICATION_REQUIRED', 401);

    const platformRole = user.platformRole || 'user';

    // Platform admins don't need organization context
    if (platformRole === 'platform_admin') {
      req.user = {
        id: user.id,
        email: user.email,
        platformRole: 'platform_admin',
        organizationId: null,
        role: null,
      };
      req.organizationId = null;
      return next();
    }

    // Regular users must have organization context
    const requestedOrgId = req.headers['x-org-id'] || req.query.organizationId || req.query.org_id || req.params?.orgId || req.body?.organizationId || req.body?.org_id;
    const memberships = await prisma.orgMember.findMany({
      where: { userId: user.id },
      orderBy: { joinedAt: 'asc' },
    });

    if (!memberships.length) {
      throw new ApiError('Forbidden', 'FORBIDDEN', 403);
    }

    const candidateMembership = requestedOrgId
      ? memberships.find((membership) => String(membership.organizationId) === String(requestedOrgId))
      : memberships[0];

    if (!candidateMembership) {
      throw new ApiError('Forbidden', 'FORBIDDEN', 403);
    }

    req.user = {
      id: user.id,
      email: user.email,
      platformRole: platformRole,
      organizationId: candidateMembership.organizationId,
      role: candidateMembership.role,
    };
    req.organizationId = candidateMembership.organizationId;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = authMiddleware;
