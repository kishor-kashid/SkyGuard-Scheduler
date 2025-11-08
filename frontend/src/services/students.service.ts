import api from './api';
import { Student, ApiResponse } from '../types';

export interface CreateStudentPayload {
  email: string;
  password: string;
  name: string;
  phone?: string;
  trainingLevel: 'STUDENT_PILOT' | 'PRIVATE_PILOT' | 'INSTRUMENT_RATED';
  availability?: {
    weekdays?: string[];
    preferredTimes?: string[];
    [key: string]: any;
  };
}

export async function getStudents(): Promise<Student[]> {
  const response = await api.get<ApiResponse<Student[]>>('/students');
  return response.data.data;
}

export async function createStudent(payload: CreateStudentPayload): Promise<Student> {
  const response = await api.post<ApiResponse<{ student: Student }>>('/students', payload);
  return response.data.data.student;
}

