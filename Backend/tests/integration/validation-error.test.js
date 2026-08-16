const request = require('supertest');
const app = require('../../src/app');

describe('Validation and error scenarios', () => {
  it('returns validation error for invalid login payload', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'bad-email', password: 'short' });

    expect(res.status).toBe(422);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('returns 404 when task is missing', async () => {
    const email = `error-user.${Date.now()}@example.com`;

    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Error User',
        email,
        password: 'StrongPassword123!',
        organizationName: 'Error Org',
      });

    const res = await request(app)
      .get('/api/tasks/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${registerRes.body.accessToken}`);

    expect(res.status).toBe(404);
    expect(res.body.code).toBe('TASK_NOT_FOUND');
  });
});
