import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as authService from '../../services/auth.service';
import api from '../../services/api';

// Mock axios
vi.mock('../../services/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('login', () => {
    it('should login successfully and store token', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            user: {
              id: 1,
              email: 'test@example.com',
              role: 'STUDENT',
            },
            token: 'mock-jwt-token',
          },
        },
      };

      vi.mocked(api.post).mockResolvedValue(mockResponse);

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.user.email).toBe('test@example.com');
      expect(result.token).toBe('mock-jwt-token');
    });

    it('should handle login error', async () => {
      const error = {
        response: {
          data: {
            message: 'Invalid credentials',
          },
        },
      };

      vi.mocked(api.post).mockRejectedValue(error);

      await expect(
        authService.login({ email: 'test@example.com', password: 'wrongpassword' })
      ).rejects.toEqual(error);
    });
  });

  describe('register', () => {
    it('should register successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            user: {
              id: 1,
              email: 'newuser@example.com',
              role: 'STUDENT',
            },
            token: 'mock-jwt-token',
          },
        },
      };

      vi.mocked(api.post).mockResolvedValue(mockResponse);

      const result = await authService.register({
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
        role: 'STUDENT',
        trainingLevel: 'STUDENT_PILOT',
      });

      expect(api.post).toHaveBeenCalledWith('/auth/register', expect.any(Object));
      expect(result.user.email).toBe('newuser@example.com');
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user from token', async () => {
      localStorage.setItem('token', 'mock-token');

      const mockResponse = {
        data: {
          success: true,
          data: {
            id: 1,
            email: 'test@example.com',
            role: 'STUDENT',
          },
        },
      };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await authService.getCurrentUser();

      expect(api.get).toHaveBeenCalledWith('/auth/me');
      expect(result.email).toBe('test@example.com');
    });
  });

  describe('logout', () => {
    it('should clear token from localStorage', () => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({ id: 1 }));

      authService.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });
});

