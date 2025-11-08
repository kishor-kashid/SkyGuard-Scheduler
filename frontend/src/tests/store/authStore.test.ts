import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '../../store/authStore';
import * as authService from '../../services/auth.service';

// Mock the auth service
vi.mock('../../services/auth.service', () => ({
  login: vi.fn(),
  register: vi.fn(),
  getCurrentUser: vi.fn(),
  logout: vi.fn(),
}));

describe('Auth Store', () => {
  beforeEach(() => {
    // Clear store state before each test
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
    });
    localStorage.clear();
  });

  describe('login', () => {
    it('should login successfully and store user data', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        role: 'STUDENT' as const,
        name: 'Test User',
      };
      const mockToken = 'mock-jwt-token';

      vi.mocked(authService.login).mockResolvedValue({
        user: mockUser,
        token: mockToken,
      });

      await useAuthStore.getState().login({ email: 'test@example.com', password: 'password123' });

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe(mockToken);
      expect(state.isAuthenticated).toBe(true);
      expect(localStorage.getItem('token')).toBe(mockToken);
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
    });

    it('should handle login failure', async () => {
      const error = new Error('Invalid credentials');
      vi.mocked(authService.login).mockRejectedValue(error);

      await expect(
        useAuthStore.getState().login({ email: 'test@example.com', password: 'wrongpassword' })
      ).rejects.toThrow('Invalid credentials');

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('logout', () => {
    it('should clear user data and token', () => {
      // Mock the logout function to actually clear localStorage
      vi.mocked(authService.logout).mockImplementation(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      });

      // Set initial state
      useAuthStore.setState({
        user: { id: 1, email: 'test@example.com', role: 'STUDENT' },
        token: 'mock-token',
        isAuthenticated: true,
      });
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({ id: 1 }));

      useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('checkAuth', () => {
    it('should restore auth state from localStorage', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        role: 'STUDENT' as const,
        name: 'Test User',
      };
      const mockToken = 'mock-jwt-token';

      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));

      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);

      await useAuthStore.getState().checkAuth();

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe(mockToken);
      expect(state.isAuthenticated).toBe(true);
    });

    it('should clear state if token is invalid', async () => {
      localStorage.setItem('token', 'invalid-token');
      localStorage.setItem('user', JSON.stringify({ id: 1 }));

      vi.mocked(authService.getCurrentUser).mockRejectedValue(
        new Error('Invalid token')
      );

      await useAuthStore.getState().checkAuth();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(localStorage.getItem('token')).toBeNull();
    });
  });
});

