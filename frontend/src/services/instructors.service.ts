import api from './api';
import { Instructor, ApiResponse } from '../types';

export async function getInstructors(): Promise<Instructor[]> {
  const response = await api.get<ApiResponse<Instructor[]>>('/instructors');
  return response.data.data;
}

export async function getInstructorById(id: number): Promise<Instructor> {
  const response = await api.get<ApiResponse<Instructor>>(`/instructors/${id}`);
  return response.data.data;
}

