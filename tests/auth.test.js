const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');

jest.setTimeout(120000);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {});
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

afterEach(async () => {
  const collections = Object.keys(mongoose.connection.collections);
  for (const c of collections) await mongoose.connection.collections[c].deleteMany({});
});

test('login returns token', async () => {
  const User = require('../src/models/user.model').User;
  await User.create({ name: 'AuthTest', email: 'auth@test.com', password: 'pass123', role: 'agent' });
  const res = await request(app).post('/api/auth/login').send({ email: 'auth@test.com', password: 'pass123' });
  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveProperty('token');
});
