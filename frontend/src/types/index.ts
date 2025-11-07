// User and Auth Types
export interface User {
  id: number;
  email: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  name?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Student Types
export interface Student {
  id: number;
  userId: number;
  name: string;
  phone?: string;
  trainingLevel: 'STUDENT_PILOT' | 'PRIVATE_PILOT' | 'INSTRUMENT_RATED';
  availability?: any;
  email?: string;
}

// Flight Types
export interface Flight {
  id: number;
  studentId: number;
  instructorId: number;
  aircraftId: number;
  scheduledDate: string;
  departureLocation: string;
  destinationLocation?: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'WEATHER_HOLD' | 'COMPLETED';
  flightType: 'TRAINING' | 'SOLO' | 'CROSS_COUNTRY';
  notes?: string;
  student?: {
    id: number;
    name: string;
    trainingLevel: string;
  };
  instructor?: {
    id: number;
    name: string;
  };
  aircraft?: {
    id: number;
    tailNumber: string;
    model: string;
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
}

