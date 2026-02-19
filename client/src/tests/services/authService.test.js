import { describe, it, expect, vi } from 'vitest';
import api from '../../services/api';
import * as authService from '../../services/authService';

vi.mock('../../services/api');

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should call API with correct endpoint and data', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      const mockResponseData = {
        success: true,
        token: 'fake-token',
        user: { ...userData, id: '123' }
      };

      api.post.mockResolvedValue({ data: mockResponseData });

      const result = await authService.register(userData);

      expect(api.post).toHaveBeenCalledWith('/auth/register', userData);
      expect(result).toEqual(mockResponseData);
    });

    it('should handle registration errors', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      const mockError = {
        response: {
          data: {
            message: 'Email already exists'
          }
        }
      };

      api.post.mockRejectedValue(mockError);

      await expect(authService.register(userData)).rejects.toEqual(mockError);
    });
  });

  describe('login', () => {
    it('should call API with correct endpoint and credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockResponseData = {
        success: true,
        token: 'fake-token',
        user: { email: credentials.email, id: '123' }
      };

      api.post.mockResolvedValue({ data: mockResponseData });

      const result = await authService.login(credentials);

      expect(api.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(result).toEqual(mockResponseData);
    });

    it('should handle login errors', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const mockError = {
        response: {
          data: {
            message: 'Invalid credentials'
          }
        }
      };

      api.post.mockRejectedValue(mockError);

      await expect(authService.login(credentials)).rejects.toEqual(mockError);
    });
  });

  describe('getCurrentUser', () => {
    it('should call API to get current user', async () => {
      const mockResponseData = {
        success: true,
        user: {
          id: '123',
          name: 'Test User',
          email: 'test@example.com'
        }
      };

      api.get.mockResolvedValue({ data: mockResponseData });

      const result = await authService.getCurrentUser();

      expect(api.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockResponseData);
    });

    it('should handle unauthorized errors', async () => {
      const mockError = {
        response: {
          status: 401,
          data: {
            message: 'Not authorized'
          }
        }
      };

      api.get.mockRejectedValue(mockError);

      await expect(authService.getCurrentUser()).rejects.toEqual(mockError);
    });
  });
});
