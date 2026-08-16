const request = require('supertest');
const app = require('./src/app');

(async () => {
  const email = `debug.${Date.now()}@example.com`;
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Jane Doe',
      email,
      password: 'StrongPassword123!',
      organizationName: 'Acme Inc',
    });

  console.log('STATUS', res.status);
  console.log('BODY', JSON.stringify(res.body));
  process.exit(0);
})().catch((error) => {
  console.error('ERROR', error);
  process.exit(1);
});
