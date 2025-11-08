import api from './api';
import { ApiResponse } from '../types';

// Weather Briefing Types
export interface RiskAssessment {
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
  factors: string[];
  summary: string;
}

export interface WeatherRecommendation {
  action: 'PROCEED' | 'CAUTION' | 'DELAY' | 'CANCEL';
  reasoning: string;
  alternatives?: string[];
}

export interface HistoricalComparison {
  similarConditions?: {
    date: string;
    conditions: string;
    outcome: string;
  }[];
  trends?: string;
  confidence: number;
}

export interface WeatherBriefing {
  summary: string;
  currentConditions: {
    description: string;
    visibility: number;
    ceiling?: number;
    windSpeed: number;
    temperature: number;
    precipitation: boolean;
    thunderstorms: boolean;
    icing: boolean;
  };
  forecast: {
    description: string;
    expectedChanges: string[];
    timeRange: string;
  };
  riskAssessment: RiskAssessment;
  recommendation: WeatherRecommendation;
  historicalComparison?: HistoricalComparison;
  confidence: number; // 0-1
  generatedAt: string;
  expiresAt: string;
}

export interface WeatherBriefingResponse {
  success: boolean;
  data: WeatherBriefing;
  cached?: boolean;
}

export interface GenerateCustomBriefingRequest {
  location: {
    name: string;
    lat: number;
    lon: number;
  };
  dateTime: string; // ISO 8601
  trainingLevel: 'STUDENT_PILOT' | 'PRIVATE_PILOT' | 'INSTRUMENT_RATED';
  flightRoute?: {
    departure: { name: string; lat: number; lon: number };
    destination?: { name: string; lat: number; lon: number };
  };
}

/**
 * Generate weather briefing for a flight
 */
export async function generateFlightBriefing(flightId: number): Promise<WeatherBriefing> {
  const response = await api.post<WeatherBriefingResponse>(
    `/flights/${flightId}/weather-briefing`
  );
  return response.data.data;
}

/**
 * Get cached weather briefing for a flight
 */
export async function getFlightBriefing(flightId: number): Promise<WeatherBriefing> {
  const response = await api.get<WeatherBriefingResponse>(
    `/flights/${flightId}/weather-briefing`
  );
  return response.data.data;
}

/**
 * Generate weather briefing for custom location/time
 */
export async function generateCustomBriefing(
  request: GenerateCustomBriefingRequest
): Promise<WeatherBriefing> {
  const response = await api.post<WeatherBriefingResponse>('/weather/briefing', request);
  return response.data.data;
}

