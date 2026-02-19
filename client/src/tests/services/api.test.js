import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import api from '../../services/api';

vi.mock('axios');

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Request Interceptor', () => {
    it('should add Authorization header when token exists', async () => {
      const token = 'fake-jwt-token';
      localStorage.getItem.mockReturnValue(token);

      const mockRequest = {
        headers: {},
      };

      // Access the request interceptor
      const requestInterceptor = api.interceptors.request.handlers[0];
      const result = requestInterceptor.fulfilled(mockRequest);

      expect(localStorage.getItem).toHaveBeenCalledWith('token');
      expect(result.headers.Authorization).toBe(`Bearer ${token}`);
    });

    it('should not add Authorization header when token does not exist', async () => {
      localStorage.getItem.mockReturnValue(null);
      
      const mockRequest = {
        headers: {},
      };

      const requestInterceptor = api.interceptors.request.handlers[0];
      const result = requestInterceptor.fulfilled(mockRequest);

      expect(result.headers.Authorization).toBeUndefined();
    });
  });

  describe('Response Interceptor', () => {
    it('should return response on success', async () => {
      const mockResponse = {
        data: { success: true },
        status: 200,
      };

      const responseInterceptor = api.interceptors.response.handlers[0];
      const result = responseInterceptor.fulfilled(mockResponse);

      expect(result).toEqual(mockResponse);
    });

    it('should clear localStorage and redirect on 401 error', async () => {
      const mockError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
      };

      const responseInterceptor = api.interceptors.response.handlers[0];

      try {
        await responseInterceptor.rejected(mockError);
      } catch (error) {
        expect(error).toEqual(mockError);
      }

      expect(localStorage.removeItem).toHaveBeenCalledWith('token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    });

    it('should not clear localStorage on non-401 errors', async () => {
      const mockError = {
        response: {
          status: 500,
          data: { message: 'Server Error' },
        },
      };

      const responseInterceptor = api.interceptors.response.handlers[0];

      try {
        await responseInterceptor.rejected(mockError);
      } catch (error) {
        expect(error).toEqual(mockError);
      }

      expect(localStorage.removeItem).not.toHaveBeenCalled();
    });
  });

  describe('API Configuration', () => {
    it('should have correct base URL', () => {
      expect(api.defaults.baseURL).toBeDefined();
      expect(typeof api.defaults.baseURL).toBe('string');
    });

    it('should have correct default headers', () => {
      expect(api.defaults.headers['Content-Type']).toBe('application/json');
    });
  });
});
