const Action = require('../src/models/action.model');

jest.mock('../src/models/action.model');

describe('Actions Controller', () => {

  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  test('should create action', async () => {

    const mockAction = { id: 1, type: "CALL" };

    Action.create.mockResolvedValue(mockAction);

    mockReq = {
      body: { type: "CALL" },
      user: { sub: "123" }
    };

    const { create } = require('../src/controllers/actions.controller');

    await create(mockReq, mockRes, mockNext);

    expect(Action.create).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(mockAction);

  });

  test('should list actions', async () => {

    const mockActions = [{ id: 1 }, { id: 2 }];

    Action.find.mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockActions)
    });

    mockReq = {};

    const { list } = require('../src/controllers/actions.controller');

    await list(mockReq, mockRes, mockNext);

    expect(mockRes.json).toHaveBeenCalledWith(mockActions);

  });

});