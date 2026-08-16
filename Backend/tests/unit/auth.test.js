const bcrypt = require('bcrypt');
const { hashPassword, comparePasswords, createAccessToken, createRefreshToken, verifyRefreshToken, isTokenExpired } = require('../../src/services/auth.service');
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../../src/utils/jwt');

describe('Authentication logic', () => {
  test('hashes and verifies passwords', async () => {
    const password = 'StrongPassword123!';
    const hash = await hashPassword(password);
    expect(hash).not.toBe(password);
    expect(await comparePasswords(password, hash)).toBe(true);
    expect(await comparePasswords('wrong', hash)).toBe(false);
  });

  test('generates valid JWTs', () => {
    const access = createAccessToken('user-1');
    const verified = verifyToken(access, process.env.JWT_ACCESS_SECRET || 'test-secret');
    expect(verified.sub).toBe('user-1');
    expect(verified.type).toBe('access');

    const refresh = createRefreshToken('user-1');
    const refreshVerified = verifyToken(refresh, process.env.JWT_REFRESH_SECRET || 'test-secret');
    expect(refreshVerified.sub).toBe('user-1');
    expect(refreshVerified.type).toBe('refresh');
  });

  test('detects expired tokens', () => {
    const expired = isTokenExpired({ exp: Math.floor(Date.now() / 1000) - 60 });
    expect(expired).toBe(true);
  });

  test('validates refresh tokens', () => {
    const value = createRefreshToken('user-1');
    expect(verifyRefreshToken(value)).toBeTruthy();
  });
});
