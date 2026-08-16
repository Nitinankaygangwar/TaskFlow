const request = require('supertest');
const app = require('../../src/app');

describe('Cross-tenant access', () => {
  it('rejects access to another organization when x-org-id does not match membership', async () => {
    const emailA = `tenant-a.${Date.now()}@example.com`;
    const emailB = `tenant-b.${Date.now() + 1}@example.com`;

    const registerA = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Tenant A',
        email: emailA,
        password: 'StrongPassword123!',
        organizationName: 'Org A',
      });

    const registerB = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Tenant B',
        email: emailB,
        password: 'StrongPassword123!',
        organizationName: 'Org B',
      });

    const tokenA = registerA.body.accessToken;
    const orgBId = registerB.body.organizationId ?? registerB.body.organization?.id;

    if (!orgBId) {
      throw new Error(`Missing organization id in register response: ${JSON.stringify(registerB.body)}`);
    }

    const res = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-org-id', orgBId);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });
});
