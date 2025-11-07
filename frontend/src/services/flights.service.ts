import api from './api';
import { Flight, ApiResponse } from '../types';

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

export interface UpdateFlightPayload {
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
  flightType?: 'TRAINING' | 'SOLO' | 'CROSS_COUNTRY';
  status?: 'CONFIRMED' | 'CANCELLED' | 'WEATHER_HOLD' | 'COMPLETED';
  notes?: string;
}

export interface FlightFilters {
  status?: string;
  studentId?: number;
  instructorId?: number;
  startDate?: string;
  endDate?: string;
}

/**
 * Get all flights with optional filters
 */
export async function getFlights(filters?: FlightFilters): Promise<Flight[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.studentId) params.append('studentId', filters.studentId.toString());
  if (filters?.instructorId) params.append('instructorId', filters.instructorId.toString());
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);

  const queryString = params.toString();
  const url = queryString ? `/flights?${queryString}` : '/flights';
  
  const response = await api.get<ApiResponse<Flight[]>>(url);
  return response.data.data;
}

/**
 * Get a single flight by ID
 */
export async function getFlightById(id: number): Promise<Flight> {
  const response = await api.get<ApiResponse<Flight>>(`/flights/${id}`);
  return response.data.data;
}

/**
 * Create a new flight
 */
export async function createFlight(payload: CreateFlightPayload): Promise<Flight> {
  const response = await api.post<ApiResponse<Flight>>('/flights', payload);
  return response.data.data;
}

/**
 * Update a flight
 */
export async function updateFlight(id: number, payload: UpdateFlightPayload): Promise<Flight> {
  const response = await api.put<ApiResponse<Flight>>(`/flights/${id}`, payload);
  return response.data.data;
}

/**
 * Cancel a flight
 */
export async function cancelFlight(id: number): Promise<void> {
  await api.delete(`/flights/${id}`);
}

/**
 * Trigger weather check for a flight
 */
export async function triggerWeatherCheck(id: number): Promise<any> {
  const response = await api.post<ApiResponse<any>>(`/flights/${id}/check-weather`);
  return response.data.data;
}

/**
 * Generate reschedule options for a flight
 */
export async function getRescheduleOptions(id: number): Promise<import('../types').RescheduleOptionsResponse> {
  const response = await api.post<ApiResponse<import('../types').RescheduleOptionsResponse>>(`/flights/${id}/reschedule-options`);
  return response.data.data;
}

/**
 * Confirm a reschedule selection
 */
export async function confirmReschedule(id: number, selectedOption: import('../types').RescheduleOption): Promise<Flight> {
  const response = await api.post<ApiResponse<Flight>>(`/flights/${id}/confirm-reschedule`, {
    selectedOption,
  });
  return response.data.data;
}

