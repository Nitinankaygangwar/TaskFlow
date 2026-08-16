const request = require('supertest');
const app = require('../../src/app');

describe('Auth flow', () => {
  it('registers, logs in, refreshes, and logs out', async () => {
    const email = `jane.${Date.now()}@example.com`;

    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jane Doe',
        email,
        password: 'StrongPassword123!',
        organizationName: 'Acme Inc'
      });

    expect(registerRes.status).toBe(201);
    expect(registerRes.body.token).toBeTruthy();

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'StrongPassword123!' });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.accessToken).toBeTruthy();

    const accessToken = loginRes.body.accessToken;
    const refreshToken = loginRes.body.refreshToken;

    const protectedRes = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${accessToken}`);

    expect([200, 201]).toContain(protectedRes.status);

    const refreshRes = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken });

    expect(refreshRes.status).toBe(200);

    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refreshToken });

    expect(logoutRes.status).toBe(200);
  });

  it('allows signing up as a platform admin, org admin, or member', async () => {
    const platformEmail = `platform.${Date.now()}@example.com`;
    const platformRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Platform User',
        email: platformEmail,
        password: 'StrongPassword123!',
        organizationName: 'Platform Org',
        role: 'platform_admin',
      });

    expect(platformRes.status).toBe(201);
    expect(platformRes.body.user.platformRole).toBe('platform_admin');

    const orgEmail = `orgadmin.${Date.now()}@example.com`;
    const orgAdminRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Org Admin User',
        email: orgEmail,
        password: 'StrongPassword123!',
        organizationName: 'Org Admin Company',
        role: 'org_admin',
      });

    expect(orgAdminRes.status).toBe(201);
    expect(orgAdminRes.body.primaryOrganizationRole).toBe('org_admin');

    const memberEmail = `member.${Date.now()}@example.com`;
    const memberRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Member User',
        email: memberEmail,
        password: 'StrongPassword123!',
        organizationName: 'Member Company',
        role: 'member',
      });

    expect(memberRes.status).toBe(201);
    expect(memberRes.body.primaryOrganizationRole).toBe('member');
  });

  it('allows platform admin to create, list, and delete organizations', async () => {
    const email = `platformcrud.${Date.now()}@example.com`;

    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Platform CRUD Admin',
        email,
        password: 'StrongPassword123!',
        organizationName: 'Platform Root Org',
        role: 'platform_admin',
      });

    expect(registerRes.status).toBe(201);
    const token = registerRes.body.accessToken;

    const createRes = await request(app)
      .post('/api/platform/organizations')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Acme Holdings' });

    expect(createRes.status).toBe(201);
    expect(createRes.body.name).toBe('Acme Holdings');

    const listRes = await request(app)
      .get('/api/platform/organizations')
      .set('Authorization', `Bearer ${token}`)
      .query({ page: 1, limit: 20 });

    expect(listRes.status).toBe(200);
    expect(listRes.body.data.some((org) => org.id === createRes.body.id)).toBe(true);

    const deleteRes = await request(app)
      .delete(`/api/platform/organizations/${createRes.body.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteRes.status).toBe(204);
  });
});
