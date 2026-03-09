const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

jest.setTimeout(120000);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { });
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

afterEach(async () => {
  const collections = Object.keys(mongoose.connection.collections);
  for (const c of collections) await mongoose.connection.collections[c].deleteMany({});
});

test('createPayment: records payment and updates invoice', async () => {
  const User = require('../src/models/user.model').User;
  const Invoice = require('../src/models/invoice.model');
  const paymentsService = require('../src/services/payments.service');

  const user = await User.create({ name: 'T', email: 't@example.com', password: 'pass123', role: 'agent' });
  const invoice = await Invoice.create({ client: new mongoose.Types.ObjectId(), reference: 'INV-1', amount: 100, dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24) });

  const result = await paymentsService.createPayment({ invoiceId: invoice._id.toString(), amount: 40, method: 'manual', recordedBy: user._id.toString() });

  expect(result).toHaveProperty('payment');
  expect(result).toHaveProperty('invoice');
  expect(result.payment.amount).toBe(40);
  expect(result.invoice.paid).toBe(40);
  expect(result.invoice.status).toBe('partially_paid');
});

test('createPayment: prevents overpayment', async () => {
  const User = require('../src/models/user.model').User;
  const Invoice = require('../src/models/invoice.model');
  const paymentsService = require('../src/services/payments.service');
  const ApiError = require('../src/utils/apiError');

  const user = await User.create({ name: 'T2', email: 't2@example.com', password: 'pass123', role: 'agent' });
  const invoice = await Invoice.create({ client: new mongoose.Types.ObjectId(), reference: 'INV-2', amount: 50 });

  // first valid payment
  await paymentsService.createPayment({ invoiceId: invoice._id.toString(), amount: 30, method: 'manual', recordedBy: user._id.toString() });

  // attempt to overpay remaining 20 with 25
  await expect(paymentsService.createPayment({ invoiceId: invoice._id.toString(), amount: 25, method: 'manual', recordedBy: user._id.toString() }))
    .rejects.toMatchObject({ status: 400 });
});
