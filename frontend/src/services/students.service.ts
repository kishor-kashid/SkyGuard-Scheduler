import api from './api';
import { Student, ApiResponse } from '../types';

export async function getStudents(): Promise<Student[]> {
  const response = await api.get<ApiResponse<Student[]>>('/students');
  return response.data.data;
}

