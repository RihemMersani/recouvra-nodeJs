const request = require('supertest');
const app = require('../src/app');
const Client = require('../src/models/client.model');
const ApiError = require('../src/utils/apiError');

jest.mock('../src/models/client.model');

describe('Clients Controller Basic Tests', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      end: jest.fn()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it('should create a client and return 201', async () => {
      const mockClient = { id: 1, name: 'Test Client', email: 'test@test.com' };
      Client.create.mockResolvedValue(mockClient);

      mockReq = {
        body: { name: 'Test Client', email: 'test@test.com' }
      };

      const { create } = require('../src/controllers/clients.controller');
      await create(mockReq, mockRes, mockNext);

      expect(Client.create).toHaveBeenCalledWith(mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockClient);
    });
  });

  describe('list()', () => {
    it('should return all clients', async () => {
      const mockClients = [{ id: 1, name: 'Client 1' }, { id: 2, name: 'Client 2' }];
      Client.find.mockResolvedValue(mockClients);

      mockReq = {};

      const { list } = require('../src/controllers/clients.controller');
      await list(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(mockClients);
    });
  });

  describe('get()', () => {
    it('should return client by id', async () => {
      const mockClient = { id: 1, name: 'Test Client' };
      Client.findById.mockResolvedValue(mockClient);

      mockReq = { params: { id: 1 } };

      const { get } = require('../src/controllers/clients.controller');
      await get(mockReq, mockRes, mockNext);

      expect(Client.findById).toHaveBeenCalledWith(1);
      expect(mockRes.json).toHaveBeenCalledWith(mockClient);
    });
  });

  describe('update()', () => {
    it('should update client', async () => {
      const mockClient = { id: 1, name: 'Updated Client' };
      Client.findByIdAndUpdate.mockResolvedValue(mockClient);

      mockReq = {
        params: { id: 1 },
        body: { name: 'Updated Client' }
      };

      const { update } = require('../src/controllers/clients.controller');
      await update(mockReq, mockRes, mockNext);

      expect(Client.findByIdAndUpdate).toHaveBeenCalledWith(1, mockReq.body, { new: true });
      expect(mockRes.json).toHaveBeenCalledWith(mockClient);
    });
  });

  describe('remove()', () => {
    it('should delete client and return 204', async () => {
      Client.findByIdAndDelete.mockResolvedValue(true);

      mockReq = { params: { id: 1 } };

      const { remove } = require('../src/controllers/clients.controller');
      await remove(mockReq, mockRes, mockNext);

      expect(Client.findByIdAndDelete).toHaveBeenCalledWith(1);
      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.end).toHaveBeenCalled();
    });
  });
});