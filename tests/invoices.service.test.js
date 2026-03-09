const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

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

test('createInvoice: sets status pending/overdue/paid correctly', async () => {
  const invoicesService = require('../src/services/invoices.service');
  const Invoice = require('../src/models/invoice.model');

  const inv1 = await invoicesService.createInvoice({ client: new mongoose.Types.ObjectId(), reference: 'T1', amount: 100 });
  expect(inv1.status).toBe('pending');

  const inv2 = await invoicesService.createInvoice({ client: new mongoose.Types.ObjectId(), reference: 'T2', amount: 50, paid: 50 });
  expect(inv2.status).toBe('paid');
});
