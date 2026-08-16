const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const accessSecret = process.env.JWT_ACCESS_SECRET || 'dev-access-secret';
const refreshSecret = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret';

function buildTokenPayload(userId, type) {
  return {
    sub: userId,
    type,
    jti: crypto.randomUUID(),
  };
}

function generateAccessToken(userId) {
  return jwt.sign(buildTokenPayload(userId, 'access'), accessSecret, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  });
}

function generateRefreshToken(userId) {
  return jwt.sign(buildTokenPayload(userId, 'refresh'), refreshSecret, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
}

function verifyToken(token, secret) {
  return jwt.verify(token, secret);
}

function getAccessTokenSecret() {
  return accessSecret;
}

function getRefreshTokenSecret() {
  return refreshSecret;
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  getAccessTokenSecret,
  getRefreshTokenSecret,
};
