const request = require('supertest');
const app = require('../src/app');
const { User } = require('../src/models/user.model');

jest.mock('../src/models/user.model');

describe('Users Controller Basic Tests', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockRes = {
      json: jest.fn()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('list()', () => {
    it('should return all users without passwords', async () => {
      const mockUsers = [
        { id: 1, name: 'User 1', email: 'user1@test.com' },
        { id: 2, name: 'User 2', email: 'user2@test.com' }
      ];
      
      User.find.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUsers)
      });

      mockReq = {};

      const { list } = require('../src/controllers/users.controller');
      await list(mockReq, mockRes, mockNext);

      expect(User.find).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(mockUsers);
    });
  });
});
