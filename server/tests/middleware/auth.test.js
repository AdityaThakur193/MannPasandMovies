const jwt = require('jsonwebtoken');
const auth = require('../../middleware/auth');
const User = require('../../models/User');

// Mock User model
jest.mock('../../models/User');

describe('Auth Middleware Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      header: jest.fn()
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Token Validation', () => {
    it('should fail without token', async () => {
      req.header.mockReturnValue(null);

      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'No authentication token, access denied'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should fail with invalid token', async () => {
      req.header.mockReturnValue('Bearer invalid-token');

      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token is not valid'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should fail with expired token', async () => {
      const expiredToken = jwt.sign(
        { id: 'user123' },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' }
      );

      req.header.mockReturnValue(`Bearer ${expiredToken}`);

      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token is not valid'
      });
    });

    it('should fail if user does not exist', async () => {
      const token = jwt.sign(
        { id: 'nonexistent-user' },
        process.env.JWT_SECRET
      );

      req.header.mockReturnValue(`Bearer ${token}`);
      User.findById.mockResolvedValue(null);

      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token is not valid'
      });
    });

    it('should pass with valid token and existing user', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com'
      };

      const token = jwt.sign(
        { id: mockUser._id },
        process.env.JWT_SECRET
      );

      req.header.mockReturnValue(`Bearer ${token}`);
      User.findById.mockResolvedValue(mockUser);

      await auth(req, res, next);

      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should handle Bearer token correctly', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com'
      };

      const token = jwt.sign(
        { id: mockUser._id },
        process.env.JWT_SECRET
      );

      req.header.mockReturnValue(`Bearer ${token}`);
      User.findById.mockResolvedValue(mockUser);

      await auth(req, res, next);

      expect(User.findById).toHaveBeenCalledWith(mockUser._id);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors', async () => {
      const token = jwt.sign({ id: 'user123' }, process.env.JWT_SECRET);
      req.header.mockReturnValue(`Bearer ${token}`);
      User.findById.mockRejectedValue(new Error('Database error'));

      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token is not valid'
      });
    });
  });
});
