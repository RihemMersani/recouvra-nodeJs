const request = require('supertest');
const app = require('../src/app');
const Payment = require('../src/models/payment.model');
const paymentsService = require('../src/services/payments.service');

// Mock dependencies
jest.mock('../src/models/payment.model');
jest.mock('../src/services/payments.service');

describe('Payments Controller Basic Tests', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it('should create a payment and return 201', async () => {
      const mockPayment = { id: 1, amount: 100, method: 'CASH' };
      paymentsService.createPayment.mockResolvedValue(mockPayment);

      mockReq = {
        body: { invoice: 1, amount: 100, method: 'CASH' },
        user: { sub: 'user123' }
      };

      const { create } = require('../src/controllers/payments.controller');
      await create(mockReq, mockRes, mockNext);

      expect(paymentsService.createPayment).toHaveBeenCalledWith({
        invoiceId: 1,
        amount: 100,
        method: 'CASH',
        recordedBy: 'user123'
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockPayment);
    });

    it('should call next with error if service fails', async () => {
      const error = new Error('Service error');
      paymentsService.createPayment.mockRejectedValue(error);

      mockReq = {
        body: { invoice: 1, amount: 100, method: 'CASH' },
        user: { sub: 'user123' }
      };

      const { create } = require('../src/controllers/payments.controller');
      await create(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('list()', () => {
    it('should return all payments', async () => {
      const mockPayments = [{ id: 1, amount: 100 }, { id: 2, amount: 200 }];
      Payment.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockPayments)
      });

      mockReq = {};

      const { list } = require('../src/controllers/payments.controller');
      await list(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(mockPayments);
    });

    it('should call next with error if find fails', async () => {
      const error = new Error('Database error');
      Payment.find.mockReturnValue({
        populate: jest.fn().mockRejectedValue(error)
      });

      mockReq = {};

      const { list } = require('../src/controllers/payments.controller');
      await list(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});