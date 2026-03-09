
const request = require('supertest');
const app = require('../src/app');
const Invoice = require('../src/models/invoice.model');
const ApiError = require('../src/utils/apiError');

// Mock dependencies
jest.mock('../src/models/invoice.model');

describe('Invoices Controller Basic Tests', () => {
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
    it('should create an invoice and return 201', async () => {
      const mockInvoice = {
        id: 1,
        amount: 1000,
        recalculateStatus: jest.fn(),
        save: jest.fn().mockResolvedValue(true)
      };

      Invoice.create.mockResolvedValue(mockInvoice);

      mockReq = {
        body: { clientId: 1, amount: 1000, dueDate: '2024-12-31' }
      };

      const { create } = require('../src/controllers/invoices.controller');

      await create(mockReq, mockRes, mockNext);

      expect(Invoice.create).toHaveBeenCalledWith(mockReq.body);
      expect(mockInvoice.recalculateStatus).toHaveBeenCalled();
      expect(mockInvoice.save).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockInvoice);
    });
  });

  describe('list()', () => {
    it('should return all invoices', async () => {
      const mockInvoices = [
        { id: 1, amount: 1000 },
        { id: 2, amount: 2000 }
      ];

      Invoice.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockInvoices)
      });

      mockReq = {};

      const { list } = require('../src/controllers/invoices.controller');

      await list(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(mockInvoices);
    });
  });

  describe('get()', () => {

    it('should return invoice by id', async () => {
      const mockInvoice = { id: 1, amount: 1000 };

      Invoice.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockInvoice)
      });

      mockReq = { params: { id: 1 } };

      const { get } = require('../src/controllers/invoices.controller');

      await get(mockReq, mockRes, mockNext);

      expect(Invoice.findById).toHaveBeenCalledWith(1);
      expect(mockRes.json).toHaveBeenCalledWith(mockInvoice);
    });

    it('should return 404 if invoice not found', async () => {
      Invoice.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      mockReq = { params: { id: 999 } };

      const { get } = require('../src/controllers/invoices.controller');

      await get(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();

      const error = mockNext.mock.calls[0][0];

      expect(error).toBeInstanceOf(ApiError);
      expect(error.status).toBe(404);
    });

  });

  describe('update()', () => {

    it('should update invoice', async () => {
      const mockInvoice = {
        id: 1,
        amount: 1000,
        recalculateStatus: jest.fn(),
        save: jest.fn().mockResolvedValue(true)
      };

      Invoice.findById.mockResolvedValue(mockInvoice);

      mockReq = {
        params: { id: 1 },
        body: { amount: 1500 }
      };

      const { update } = require('../src/controllers/invoices.controller');

      await update(mockReq, mockRes, mockNext);

      expect(mockInvoice.recalculateStatus).toHaveBeenCalled();
      expect(mockInvoice.save).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(mockInvoice);
    });

  });

  describe('remove()', () => {

    it('should delete invoice and return 204', async () => {
      Invoice.findByIdAndDelete.mockResolvedValue(true);

      mockReq = { params: { id: 1 } };

      const { remove } = require('../src/controllers/invoices.controller');

      await remove(mockReq, mockRes, mockNext);

      expect(Invoice.findByIdAndDelete).toHaveBeenCalledWith(1);
      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.end).toHaveBeenCalled();
    });

  });

});

