import { UserRole, TrainingLevel, FlightStatus, FlightType, RescheduleStatus, NotificationType } from '@prisma/client';

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  phone?: string;
  trainingLevel?: TrainingLevel;
}

export interface JWTPayload {
  userId: number;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  user: {
    id: number;
    email: string;
    role: UserRole;
    name?: string;
  };
  token: string;
}

// User Types
export interface User {
  id: number;
  email: string;
  role: UserRole;
  createdAt: Date;
  student?: Student;
  instructor?: Instructor;
}

export interface Student {
  id: number;
  userId: number;
  name: string;
  phone?: string;
  trainingLevel: TrainingLevel;
  availability?: string;
}

export interface CreateStudentRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  trainingLevel: TrainingLevel;
  availability?: {
    weekdays?: string[];
    preferredTimes?: string[];
    [key: string]: any;
  };
}

export interface UpdateStudentRequest {
  name?: string;
  phone?: string;
  trainingLevel?: TrainingLevel;
  availability?: {
    weekdays?: string[];
    preferredTimes?: string[];
    [key: string]: any;
  };
}

export interface Instructor {
  id: number;
  userId: number;
  name: string;
  phone?: string;
  certifications?: string;
}

// Flight Types
export interface FlightBooking {
  id: number;
  studentId: number;
  instructorId: number;
  aircraftId: number;
  scheduledDate: Date;
  departureLocation: string;
  destinationLocation?: string;
  status: FlightStatus;
  flightType: FlightType;
  notes?: string;
}

export interface CreateFlightRequest {
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
  flightType: FlightType;
  notes?: string;
}

export interface UpdateFlightRequest {
  scheduledDate?: string;
  departureLocation?: {
    name: string;
    lat: number;
    lon: number;
  };
  destinationLocation?: {
    name: string;
    lat: number;
    lon: number;
  };
  flightType?: FlightType;
  status?: FlightStatus;
  notes?: string;
}

export interface RescheduleRequest {
  selectedOption: {
    dateTime: string;
    reasoning: string;
    weatherForecast: string;
  };
}

// Notification Types
export interface Notification {
  id: number;
  userId: number;
  bookingId?: number;
  type: NotificationType;
  message: string;
  sentAt: Date;
  readAt?: Date;
}

// Error Types
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Weather Types
export interface WeatherData {
  location: {
    name: string;
    lat: number;
    lon: number;
  };
  conditions: WeatherConditions;
  timestamp: Date;
}

export interface WeatherConditions {
  visibility: number; // in miles
  ceiling?: number; // in feet (cloud base height)
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

export interface WeatherCheckResult {
  isSafe: boolean;
  reason?: string;
  weatherData: WeatherData;
  violations: string[];
}

export interface DemoScenario {
  id: string;
  name: string;
  description: string;
  weatherConditions: WeatherConditions;
  affectsTrainingLevels: TrainingLevel[];
}

export interface Location {
  name: string;
  lat: number;
  lon: number;
}

// AI Rescheduling Types
export interface TimeSlot {
  dateTime: string; // ISO 8601 format
  available: boolean;
  reason?: string;
}

export interface RescheduleOption {
  dateTime: string; // ISO 8601 format
  reasoning: string; // AI-generated explanation
  weatherForecast: string; // Expected weather conditions
  priority: number; // 1-3, with 1 being best option
  confidence: number; // 0-1, AI confidence score
}

export interface RescheduleContext {
  originalFlight: {
    id: number;
    scheduledDate: Date;
    departureLocation: string;
    destinationLocation?: string;
    studentId: number;
    instructorId: number;
    aircraftId: number;
  };
  student: {
    id: number;
    name: string;
    trainingLevel: TrainingLevel;
    availability?: string;
  };
  instructor: {
    id: number;
    name: string;
  };
  aircraft: {
    id: number;
    tailNumber: string;
    model: string;
  };
  weatherConflict: {
    reason: string;
    violations: string[];
  };
  availableSlots: TimeSlot[];
}

// Re-export Prisma enums
export { UserRole, TrainingLevel, FlightStatus, FlightType, RescheduleStatus, NotificationType };

