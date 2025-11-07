import api from './api';
import { LoginCredentials, AuthResponse, User, ApiResponse } from '../types';

/**
 * Login user
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
  return response.data.data;
}

/**
 * Register new user
 */
export async function register(data: {
  email: string;
  password: string;
  name: string;
  role?: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  phone?: string;
  trainingLevel?: 'STUDENT_PILOT' | 'PRIVATE_PILOT' | 'INSTRUMENT_RATED';
}): Promise<AuthResponse> {
  const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
  return response.data.data;
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<User> {
  const response = await api.get<ApiResponse<User>>('/auth/me');
  return response.data.data;
}

/**
 * Logout user (client-side only)
 */
export function logout(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

