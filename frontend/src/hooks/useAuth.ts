import { useAuthStore } from '../store/authStore';

/**
 * Hook to access authentication state and user information
 */
export function useAuth() {
  const { user, isAuthenticated, token } = useAuthStore();

  return {
    user,
    isAuthenticated,
    token,
    isAdmin: user?.role === 'ADMIN',
    isInstructor: user?.role === 'INSTRUCTOR',
    isStudent: user?.role === 'STUDENT',
  };
}

