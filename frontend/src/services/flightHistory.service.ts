import api from './api';
import { ApiResponse } from '../types';

// Flight History Types
export interface FlightHistory {
  id: number;
  flightId: number;
  action: 'CREATED' | 'UPDATED' | 'CANCELLED' | 'COMPLETED' | 'RESCHEDULED' | 'STATUS_CHANGED';
  changedBy: number;
  changes?: string | null;
  notes?: string | null;
  timestamp: string;
  changedByUser?: {
    id: number;
    email: string;
    role: string;
  };
  flight?: {
    id: number;
    scheduledDate: string;
    status: string;
  };
}

export interface FlightNote {
  id: number;
  flightId: number;
  authorId: number;
  noteType: 'PRE_FLIGHT' | 'POST_FLIGHT' | 'DEBRIEF' | 'GENERAL' | 'INSTRUCTOR_NOTES' | 'STUDENT_NOTES';
  content: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: number;
    email: string;
    role: string;
  };
}

export interface CreateNotePayload {
  noteType: 'PRE_FLIGHT' | 'POST_FLIGHT' | 'DEBRIEF' | 'GENERAL' | 'INSTRUCTOR_NOTES' | 'STUDENT_NOTES';
  content: string;
}

export interface TrainingHours {
  id: number;
  studentId: number;
  flightId?: number | null;
  hours: number;
  category: 'GROUND' | 'FLIGHT' | 'SIMULATOR';
  date: string;
  instructorId?: number | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: number;
    name: string;
  };
  flight?: {
    id: number;
    scheduledDate: string;
    status?: string;
  } | null;
  instructor?: {
    id: number;
    email: string;
  } | null;
}

export interface TrainingHoursSummary {
  totalHours: number;
  hoursByCategory: {
    GROUND: number;
    FLIGHT: number;
    SIMULATOR: number;
  };
  records: TrainingHours[];
  recordCount: number;
}

export interface LogTrainingHoursPayload {
  hours: number;
  category: 'GROUND' | 'FLIGHT' | 'SIMULATOR';
  date: string; // ISO 8601 format
  instructorId?: number;
  notes?: string;
}

/**
 * Get flight history for a specific flight
 */
export async function getFlightHistory(flightId: number): Promise<FlightHistory[]> {
  const response = await api.get<ApiResponse<FlightHistory[]>>(`/flights/${flightId}/history`);
  return response.data.data;
}

/**
 * Get all flight history for a student
 */
export async function getStudentHistory(studentId: number): Promise<FlightHistory[]> {
  const response = await api.get<ApiResponse<FlightHistory[]>>(`/students/${studentId}/flight-history`);
  return response.data.data;
}

/**
 * Get all flight history for an instructor
 */
export async function getInstructorHistory(instructorId: number): Promise<FlightHistory[]> {
  const response = await api.get<ApiResponse<FlightHistory[]>>(`/instructors/${instructorId}/flight-history`);
  return response.data.data;
}

/**
 * Get notes for a flight
 */
export async function getFlightNotes(flightId: number): Promise<FlightNote[]> {
  const response = await api.get<ApiResponse<FlightNote[]>>(`/flights/${flightId}/notes`);
  return response.data.data;
}

/**
 * Create a note for a flight
 */
export async function createNote(flightId: number, payload: CreateNotePayload): Promise<FlightNote> {
  const response = await api.post<ApiResponse<FlightNote>>(`/flights/${flightId}/notes`, payload);
  return response.data.data;
}

/**
 * Update a flight note
 */
export async function updateNote(noteId: number, content: string): Promise<FlightNote> {
  const response = await api.put<ApiResponse<FlightNote>>(`/notes/${noteId}`, { content });
  return response.data.data;
}

/**
 * Delete a flight note
 */
export async function deleteNote(noteId: number): Promise<void> {
  await api.delete(`/notes/${noteId}`);
}

/**
 * Log training hours for a flight
 */
export async function logTrainingHours(flightId: number, payload: LogTrainingHoursPayload): Promise<TrainingHours> {
  const response = await api.post<ApiResponse<TrainingHours>>(`/flights/${flightId}/training-hours`, payload);
  return response.data.data;
}

/**
 * Get training hours for a student
 */
export async function getTrainingHours(
  studentId: number,
  startDate?: string,
  endDate?: string
): Promise<TrainingHoursSummary | TrainingHours[]> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const queryString = params.toString();
  const url = `/students/${studentId}/training-hours${queryString ? `?${queryString}` : ''}`;
  
  const response = await api.get<ApiResponse<TrainingHoursSummary | TrainingHours[]>>(url);
  return response.data.data;
}

