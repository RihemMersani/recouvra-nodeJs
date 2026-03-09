const mongoose = require('mongoose');
const connectDB = require('../src/config/db');

jest.mock('mongoose');

describe('Database Connection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should connect to MongoDB with URI', async () => {
    const mockUri = 'mongodb://localhost:27017/test';
    mongoose.connect.mockResolvedValue(true);

    await connectDB(mockUri);

    expect(mongoose.connect).toHaveBeenCalledWith(mockUri, {
      autoIndex: true
    });
  });

  it('should throw error if no URI provided', async () => {
    await expect(connectDB()).rejects.toThrow('MONGO_URI not provided');
  });
});