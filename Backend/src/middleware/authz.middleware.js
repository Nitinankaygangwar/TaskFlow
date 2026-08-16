const prisma = require('../config/db');
const { ApiError } = require('../utils/errors');

// Middleware: Check if user is authenticated
async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      throw new ApiError('Authentication required', 'AUTHENTICATION_REQUIRED', 401);
    }

    const { verifyToken, getAccessTokenSecret } = require('../utils/jwt');
    const decoded = verifyToken(token, getAccessTokenSecret());
    if (decoded.type !== 'access') {
      throw new ApiError('Authentication required', 'AUTHENTICATION_REQUIRED', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
    });

    if (!user) throw new ApiError('Authentication required', 'AUTHENTICATION_REQUIRED', 401);

    const platformRole = user.platformRole || 'user';
    const requestedOrgId = req.headers['x-org-id'] || req.query.organizationId || req.query.org_id || req.params?.orgId || req.body?.organizationId;
    
    // Platform admins don't need organization context
    if (platformRole === 'platform_admin') {
      req.user = {
        id: user.id,
        email: user.email,
        platformRole: 'platform_admin',
        organizationId: null,
        role: null,
      };
      req.auth = req.user;
      return next();
    }

    // Regular users must have organization context
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
      platformRole: user.platformRole,
      organizationId: candidateMembership.organizationId,
      role: candidateMembership.role,
    };
    req.auth = req.user;
    next();
  } catch (error) {
    next(error);
  }
}

// Middleware: Verify platform admin
function requirePlatformAdmin(req, res, next) {
  if (req.user?.platformRole !== 'platform_admin') {
    throw new ApiError('You do not have permission to perform this action.', 'FORBIDDEN', 403);
  }
  next();
}

// Middleware: Verify organization membership
function requireOrgMember(req, res, next) {
  if (!req.user?.organizationId) {
    throw new ApiError('Organization context required', 'FORBIDDEN', 403);
  }
  next();
}

// Middleware: Verify org admin
function requireOrgAdmin(req, res, next) {
  if (req.user?.role !== 'org_admin') {
    throw new ApiError('You do not have permission to perform this action.', 'FORBIDDEN', 403);
  }
  next();
}

// Middleware: Verify same organization
function requireSameOrganization(req, res, next) {
  const requestedOrgId = req.params.organizationId || req.body?.organizationId;
  if (requestedOrgId && String(requestedOrgId) !== String(req.user?.organizationId)) {
    throw new ApiError('Forbidden', 'FORBIDDEN', 403);
  }
  next();
}

module.exports = {
  authMiddleware,
  requirePlatformAdmin,
  requireOrgMember,
  requireOrgAdmin,
  requireSameOrganization,
};
