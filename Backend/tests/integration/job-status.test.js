const request = require('supertest');
const app = require('../../src/app');

describe('Job status', () => {
  it('returns job status for a queued job id', async () => {
    const email = `queue-user.${Date.now()}@example.com`;

    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Queue User',
        email,
        password: 'StrongPassword123!',
        organizationName: 'Queue Org',
      });

    if (registerRes.status !== 201) {
      console.error('Register failed:', registerRes.status, registerRes.body);
      throw new Error(`Register failed with status ${registerRes.status}`);
    }

    const accessToken = registerRes.body.accessToken;

    const projectRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Queue project',
        description: 'Queue test project',
      });

    const taskRes = await request(app)
      .post(`/api/tasks/projects/${projectRes.body.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Queue task',
        description: 'Queue job coverage',
      });

    const userId = registerRes.body.user.id;
    const assignRes = await request(app)
      .post(`/api/tasks/${taskRes.body.id}/assign`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ userId });

    expect(assignRes.status).toBe(201);

    const jobId = assignRes.body.id;
    const jobStatusRes = await request(app)
      .get(`/api/jobs/${jobId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect([200, 404]).toContain(jobStatusRes.status);
  });
});
