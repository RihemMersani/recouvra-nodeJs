const request = require('supertest');
const app = require('../src/app');
const Invoice = require('../src/models/invoice.model');

jest.mock('../src/models/invoice.model');

describe('Stats Controller Basic Tests', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockRes = {
      json: jest.fn()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('overview()', () => {
    it('should return overview statistics', async () => {
      Invoice.countDocuments.mockResolvedValueOnce(10); // total invoices
      
      Invoice.aggregate.mockResolvedValueOnce([
        { totalAmount: 5000, totalPaid: 3000 }
      ]);
      
      Invoice.countDocuments.mockResolvedValueOnce(3); // overdue invoices

      mockReq = {};

      const { overview } = require('../src/controllers/stats.controller');
      await overview(mockReq, mockRes, mockNext);

      expect(Invoice.countDocuments).toHaveBeenCalledTimes(2);
      expect(Invoice.aggregate).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        totalInvoices: 10,
        totalAmount: 5000,
        totalPaid: 3000,
        totalDue: 2000,
        overdue: 3
      });
    });

    it('should handle empty aggregate result', async () => {
      Invoice.countDocuments.mockResolvedValueOnce(0);
      Invoice.aggregate.mockResolvedValueOnce([]);
      Invoice.countDocuments.mockResolvedValueOnce(0);

      mockReq = {};

      const { overview } = require('../src/controllers/stats.controller');
      await overview(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        totalInvoices: 0,
        totalAmount: 0,
        totalPaid: 0,
        totalDue: 0,
        overdue: 0
      });
    });
  });
});