import api from './api';
import { ApiResponse } from '../types';

export interface WeatherCheckResult {
  isSafe: boolean;
  reason?: string;
  weatherData: WeatherData;
  violations: string[];
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

export interface WeatherCheckRequest {
  flightId: number;
}

export interface LocationWeatherCheckRequest {
  location: {
    name: string;
    lat: number;
    lon: number;
  };
  trainingLevel: 'STUDENT_PILOT' | 'PRIVATE_PILOT' | 'INSTRUMENT_RATED';
}

/**
 * Check weather for a flight booking
 */
export async function checkWeather(payload: WeatherCheckRequest): Promise<WeatherCheckResult> {
  const response = await api.post<ApiResponse<WeatherCheckResult>>('/weather/check', payload);
  return response.data.data;
}

/**
 * Check weather for a specific location and training level
 */
export async function checkLocationWeather(payload: LocationWeatherCheckRequest): Promise<WeatherCheckResult> {
  const response = await api.post<ApiResponse<WeatherCheckResult>>('/weather/check-location', payload);
  return response.data.data;
}

/**
 * Get all available demo scenarios
 */
export async function getDemoScenarios(): Promise<{ scenarios: DemoScenario[]; demoModeEnabled: boolean }> {
  const response = await api.get<ApiResponse<{ scenarios: DemoScenario[]; demoModeEnabled: boolean }>>('/weather/scenarios');
  return response.data.data;
}

/**
 * Enable/disable demo mode
 */
export async function setDemoMode(enabled: boolean): Promise<{ demoModeEnabled: boolean; message: string }> {
  const response = await api.post<ApiResponse<{ demoModeEnabled: boolean; message: string }>>('/weather/demo-mode', { enabled });
  return response.data.data;
}

/**
 * Set current demo scenario
 */
export async function setDemoScenario(scenarioId: string | null): Promise<{ scenario?: DemoScenario; message: string; demoModeEnabled: boolean }> {
  const response = await api.post<ApiResponse<{ scenario?: DemoScenario; message: string; demoModeEnabled: boolean }>>('/weather/demo-scenario', { scenarioId });
  return response.data.data;
}

/**
 * Trigger weather check for all upcoming flights (admin only)
 */
export async function triggerWeatherCheck(): Promise<{ message: string }> {
  const response = await api.post<ApiResponse<{ message: string }>>('/weather/trigger-check');
  return response.data.data;
}

