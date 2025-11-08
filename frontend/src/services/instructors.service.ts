import api from './api';
import { Instructor, ApiResponse } from '../types';

export interface CreateInstructorPayload {
  email: string;
  password: string;
  name: string;
  phone?: string;
  certifications?: string | string[];
}

export async function getInstructors(): Promise<Instructor[]> {
  const response = await api.get<ApiResponse<Instructor[]>>('/instructors');
  return response.data.data;
}

export async function getInstructorById(id: number): Promise<Instructor> {
  const response = await api.get<ApiResponse<Instructor>>(`/instructors/${id}`);
  return response.data.data;
}

export async function createInstructor(payload: CreateInstructorPayload): Promise<Instructor> {
  const response = await api.post<ApiResponse<{ instructor: Instructor }>>('/instructors', payload);
  return response.data.data.instructor;
}

