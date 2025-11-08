import api from './api';
import { Aircraft, ApiResponse } from '../types';

export async function getAircraft(): Promise<Aircraft[]> {
  const response = await api.get<ApiResponse<Aircraft[]>>('/aircraft');
  return response.data.data;
}

export async function getAircraftById(id: number): Promise<Aircraft> {
  const response = await api.get<ApiResponse<Aircraft>>(`/aircraft/${id}`);
  return response.data.data;
}

