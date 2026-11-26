const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../src/app');
const { User } = require('../../src/models/user.model');
const Client = require('../../src/models/client.model');
const Invoice = require('../../src/models/invoice.model');
const Payment = require('../../src/models/payment.model');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Promise.all([
    User.deleteMany({}),
    Client.deleteMany({}),
    Invoice.deleteMany({}),
    Payment.deleteMany({})
  ]);
});

async function login(email) {
  const response = await request(app)
    .post('/login')
    .type('form')
    .send({ email, password: 'secure-pass-123' });

  expect(response.status).toBe(302);
  expect(response.headers.location).toBe('/dashboard');
  expect(response.headers['set-cookie'][0]).toContain('recouvra_token=');
  expect(response.headers['set-cookie'][0]).toContain('HttpOnly');
  expect(response.headers['set-cookie'][0]).toContain('SameSite=Lax');
  return response.headers['set-cookie'];
}

describe('server-rendered dashboards', () => {
  it('authenticates with a secure cookie and shows admins all users and clients', async () => {
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'secure-pass-123',
      role: 'admin'
    });
    await User.create({
      name: 'Agent User',
      email: 'agent@example.com',
      password: 'secure-pass-123',
      role: 'agent'
    });
    await Client.create({ name: 'Northwind Ltd', email: 'northwind@example.com' });

    const cookies = await login(admin.email);
    const response = await request(app).get('/dashboard').set('Cookie', cookies);

    expect(response.status).toBe(200);
    expect(response.text).toContain('Agent User');
    expect(response.text).toContain('Northwind Ltd');
    expect(response.headers['content-type']).toMatch(/html/);
  });

  it('limits agent invoices to assigned clients and records payments', async () => {
    const agent = await User.create({
      name: 'Assigned Agent',
      email: 'assigned@example.com',
      password: 'secure-pass-123',
      role: 'agent'
    });
    const assignedClient = await Client.create({
      name: 'Assigned Company',
      assignedAgent: agent._id
    });
    const otherClient = await Client.create({ name: 'Other Company' });
    const [assignedInvoice, otherInvoice] = await Invoice.create([
      { client: assignedClient._id, reference: 'OWN-001', amount: 100 },
      { client: otherClient._id, reference: 'OTHER-001', amount: 200 }
    ]);

    const cookies = await login(agent.email);
    const response = await request(app).get('/dashboard').set('Cookie', cookies);

    expect(response.status).toBe(200);
    expect(response.text).toContain('OWN-001');
    expect(response.text).not.toContain('OTHER-001');

    const paymentResponse = await request(app)
      .post('/dashboard/payments')
      .set('Cookie', cookies)
      .type('form')
      .send({ invoice: assignedInvoice._id.toString(), amount: '25', method: 'manual' });

    expect(paymentResponse.status).toBe(302);
    expect(paymentResponse.headers.location).toBe('/dashboard?notice=payment-recorded');
    const updatedInvoice = await Invoice.findById(assignedInvoice._id);
    expect(updatedInvoice.paid).toBe(25);

    const forbiddenResponse = await request(app)
      .post('/dashboard/payments')
      .set('Cookie', cookies)
      .type('form')
      .send({ invoice: otherInvoice._id.toString(), amount: '25', method: 'manual' });
    expect(forbiddenResponse.status).toBe(403);
  });

  it('limits client invoices and payment history to the linked client record', async () => {
    const ownClient = await Client.create({ name: 'Client Account' });
    const otherClient = await Client.create({ name: 'Private Account' });
    const clientUser = await User.create({
      name: 'Client User',
      email: 'client@example.com',
      password: 'secure-pass-123',
      role: 'client',
      client: ownClient._id
    });
    const [ownInvoice, otherInvoice] = await Invoice.create([
      { client: ownClient._id, reference: 'CLIENT-001', amount: 120 },
      { client: otherClient._id, reference: 'PRIVATE-001', amount: 500 }
    ]);
    await Payment.create({ invoice: ownInvoice._id, amount: 20, method: 'bank' });
    await Payment.create({ invoice: otherInvoice._id, amount: 50, method: 'card' });

    const cookies = await login(clientUser.email);
    const response = await request(app).get('/dashboard').set('Cookie', cookies);

    expect(response.status).toBe(200);
    expect(response.text).toContain('CLIENT-001');
    expect(response.text).not.toContain('PRIVATE-001');
    expect(response.text).toContain('$20.00');
    expect(response.text).not.toContain('$50.00');
  });
});
