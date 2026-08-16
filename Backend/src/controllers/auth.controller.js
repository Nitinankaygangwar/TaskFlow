const { registerUser, loginUser, refreshUserToken, revokeRefreshTokenForUser, revokeAllUserSessions } = require('../services/auth.service');
const { ApiError } = require('../utils/errors');
const { registrationSchema, loginSchema, refreshSchema } = require('../validators/auth.validator');

async function register(req, res, next) {
  try {
    const payload = registrationSchema.parse(req.body);
    const result = await registerUser(payload);
    res.status(201).json({
      user: result.user,
      organization: result.organization,
      organizations: result.organizations,
      primaryOrganizationId: result.primaryOrganizationId,
      primaryOrganizationRole: result.primaryOrganizationRole,
      accessToken: result.accessToken,
      token: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const payload = loginSchema.parse(req.body);
    const result = await loginUser(payload);
    res.json({
      user: result.user,
      organizations: result.organizations,
      primaryOrganizationId: result.primaryOrganizationId,
      primaryOrganizationRole: result.primaryOrganizationRole,
      accessToken: result.accessToken,
      token: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error) {
    next(error);
  }
}

async function refresh(req, res, next) {
  try {
    const payload = refreshSchema.parse(req.body);
    const result = await refreshUserToken(payload.refreshToken);
    res.json({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      organizationId: result.organizationId,
      role: result.role,
    });
  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    const refreshToken = req.body.refreshToken || req.headers['x-refresh-token'];
    if (!refreshToken) {
      throw new ApiError('Refresh token is required', 'REFRESH_TOKEN_INVALID', 400);
    }

    await revokeRefreshTokenForUser(req.user.id, refreshToken);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

async function logoutAll(req, res, next) {
  try {
    await revokeAllUserSessions(req.user.id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login, refresh, logout, logoutAll };
