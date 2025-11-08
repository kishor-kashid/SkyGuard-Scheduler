import api from './api';
import { Airport, ApiResponse } from '../types';

export async function getAirports(): Promise<Airport[]> {
  const response = await api.get<ApiResponse<Airport[]>>('/airports');
  return response.data.data;
}

