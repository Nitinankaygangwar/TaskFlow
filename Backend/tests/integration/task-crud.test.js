const request = require('supertest');
const app = require('../../src/app');

describe('Task CRUD integration', () => {
  let accessToken;
  let projectId;
  let taskId;

  beforeAll(async () => {
    const email = `task-tester.${Date.now()}@example.com`;

    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Task Tester',
        email,
        password: 'StrongPassword123!',
        organizationName: 'TaskFlow Org',
      });

    accessToken = registerRes.body.accessToken;
    global.__taskTesterEmail = email;

    const projectRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Sprint Project',
        description: 'Project created in integration test',
      });

    projectId = projectRes.body.id;
  });

  it('creates a task in a project', async () => {
    const res = await request(app)
      .post(`/api/tasks/projects/${projectId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Build task API',
        description: 'Create task API endpoints',
        status: 'todo',
        priority: 'high',
        dueDate: '2026-08-22T00:00:00.000Z',
      });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Build task API');
    taskId = res.body.id;
  });

  it('accepts date-only due dates from the frontend date picker', async () => {
    const res = await request(app)
      .post(`/api/tasks/projects/${projectId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Design sprint task',
        description: 'Task created from a date input',
        status: 'in_progress',
        priority: 'medium',
        dueDate: '2026-08-30',
      });

    expect(res.status).toBe(201);
    expect(res.body.dueDate).toBeTruthy();
  });

  it('lists tasks for the project with pagination and filters', async () => {
    const res = await request(app)
      .get(`/api/tasks/projects/${projectId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ page: 1, limit: 20, status: 'todo', priority: 'high' });

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(expect.any(Array));
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(20);
  });

  it('gets a task by id', async () => {
    const res = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(taskId);
  });

  it('updates a task', async () => {
    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        status: 'in_progress',
        priority: 'urgent',
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('in_progress');
    expect(res.body.priority).toBe('urgent');
  });

  it('assigns and unassigns a user to the task', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: global.__taskTesterEmail,
        password: 'StrongPassword123!',
      });

    const memberId = loginRes.body.user.id;

    const assignRes = await request(app)
      .post(`/api/tasks/${taskId}/assign`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ userId: memberId });

    expect(assignRes.status).toBe(201);

    const unassignRes = await request(app)
      .post(`/api/tasks/${taskId}/unassign`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ userId: memberId });

    expect(unassignRes.status).toBe(200);
    expect(unassignRes.body.unassigned).toBe(true);
  });

  it('deletes a task', async () => {
    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.deleted).toBe(true);
  });
});
