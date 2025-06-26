const request = require('supertest');
const app = require('../server'); // Adjust path to your Express app
const { User, sequelize } = require('../src/models');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});
test('adminAddUser - duplicate phone_number', async () => {
  await request(app)
    .post('/api/users')
    .send({
      email: 'dup@example.com',
      phone_number: '1234567890',
      password: 'password123',
      first_name: 'Dup',
      last_name: 'User',
      role: 'voter'
    });
  const res = await request(app)
    .post('/api/users')
    .send({
      email: 'dup2@example.com',
      phone_number: '1234567890',
      password: 'password123',
      first_name: 'Dup2',
      last_name: 'User',
      role: 'voter'
    });
  expect(res.statusCode).toBe(409);
});