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
  weatherChecks?: Array<{
    id: number;
    checkTimestamp: string;
    isSafe: boolean;
    reason?: string;
  }>;
}

export interface CreateFlightPayload {
  studentId: number;
  instructorId: number;
  aircraftId: number;
  scheduledDate: string; // ISO 8601 format
  departureLocation: {
    name: string;
    lat: number;
    lon: number;
  };
  destinationLocation?: {
    name: string;
    lat: number;
    lon: number;
  };
  flightType: 'TRAINING' | 'SOLO' | 'CROSS_COUNTRY';
  notes?: string;
}

export type FlightStatus = 'CONFIRMED' | 'CANCELLED' | 'WEATHER_HOLD' | 'COMPLETED';

// Reschedule Types
export interface RescheduleOption {
  dateTime: string; // ISO 8601 format
  reasoning: string;
  weatherForecast: string;
  priority: number; // 1 = best, 2 = good, 3 = acceptable
  confidence: number; // 0 to 1
}

export interface RescheduleOptionsResponse {
  flightId: number;
  originalDate: string;
  options: RescheduleOption[];
}

export interface RescheduleConfirmation {
  selectedOption: RescheduleOption;
}

// Weather Types
export interface WeatherAlert {
  id: number;
  flightId: number;
  flight?: Flight;
  reason: string;
  violations: string[];
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
  isSafe: boolean;
}

export interface WeatherData {
  location: {
    name: string;
    lat: number;
    lon: number;
  };
  conditions: WeatherConditions;
  timestamp: string;
}

export interface WeatherConditions {
  visibility: number; // in miles
  ceiling?: number; // in feet
  windSpeed: number; // in knots
  windDirection?: number; // in degrees
  temperature: number; // in Fahrenheit
  humidity: number; // percentage
  precipitation: boolean;
  thunderstorms: boolean;
  icing: boolean;
  cloudCover?: number; // percentage
  description?: string;
}

export interface DemoScenario {
  id: string;
  name: string;
  description: string;
  weatherConditions: WeatherConditions;
  affectsTrainingLevels: string[];
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
