import { create } from 'zustand';
import * as flightHistoryService from '../services/flightHistory.service';
import {
  FlightHistory,
  FlightNote,
  TrainingHours,
  TrainingHoursSummary,
  CreateNotePayload,
  LogTrainingHoursPayload,
} from '../services/flightHistory.service';

interface FlightHistoryStore {
  // State
  history: FlightHistory[];
  notes: FlightNote[];
  trainingHours: TrainingHours[];
  trainingHoursSummary: TrainingHoursSummary | null;
  loading: boolean;
  error: string | null;

  // History methods
  fetchHistory: (flightId: number) => Promise<void>;
  fetchStudentHistory: (studentId: number) => Promise<void>;
  fetchInstructorHistory: (instructorId: number) => Promise<void>;

  // Notes methods
  fetchNotes: (flightId: number) => Promise<void>;
  createNote: (flightId: number, payload: CreateNotePayload) => Promise<void>;
  updateNote: (noteId: number, content: string) => Promise<void>;
  deleteNote: (noteId: number) => Promise<void>;

  // Training hours methods
  fetchTrainingHours: (studentId: number, startDate?: string, endDate?: string) => Promise<void>;
  logTrainingHours: (flightId: number, payload: LogTrainingHoursPayload) => Promise<void>;

  // Utility methods
  clearError: () => void;
  reset: () => void;
}

export const useFlightHistoryStore = create<FlightHistoryStore>((set, get) => ({
  // Initial state
  history: [],
  notes: [],
  trainingHours: [],
  trainingHoursSummary: null,
  loading: false,
  error: null,

  // Fetch flight history
  fetchHistory: async (flightId) => {
    set({ loading: true, error: null });
    try {
      const history = await flightHistoryService.getFlightHistory(flightId);
      set({ history, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch flight history',
        loading: false,
      });
    }
  },

  // Fetch student history
  fetchStudentHistory: async (studentId) => {
    set({ loading: true, error: null });
    try {
      const history = await flightHistoryService.getStudentHistory(studentId);
      set({ history, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch student history',
        loading: false,
      });
    }
  },

  // Fetch instructor history
  fetchInstructorHistory: async (instructorId) => {
    set({ loading: true, error: null });
    try {
      const history = await flightHistoryService.getInstructorHistory(instructorId);
      set({ history, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch instructor history',
        loading: false,
      });
    }
  },

  // Fetch flight notes
  fetchNotes: async (flightId) => {
    set({ loading: true, error: null });
    try {
      const notes = await flightHistoryService.getFlightNotes(flightId);
      set({ notes, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch flight notes',
        loading: false,
      });
    }
  },

  // Create note
  createNote: async (flightId, payload) => {
    set({ loading: true, error: null });
    try {
      const newNote = await flightHistoryService.createNote(flightId, payload);
      set((state) => ({
        notes: [newNote, ...state.notes],
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to create note',
        loading: false,
      });
      throw error;
    }
  },

  // Update note
  updateNote: async (noteId, content) => {
    set({ loading: true, error: null });
    try {
      const updatedNote = await flightHistoryService.updateNote(noteId, content);
      set((state) => ({
        notes: state.notes.map((n) => (n.id === noteId ? updatedNote : n)),
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to update note',
        loading: false,
      });
      throw error;
    }
  },

  // Delete note
  deleteNote: async (noteId) => {
    set({ loading: true, error: null });
    try {
      await flightHistoryService.deleteNote(noteId);
      set((state) => ({
        notes: state.notes.filter((n) => n.id !== noteId),
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to delete note',
        loading: false,
      });
      throw error;
    }
  },

  // Fetch training hours
  fetchTrainingHours: async (studentId, startDate, endDate) => {
    set({ loading: true, error: null });
    try {
      const result = await flightHistoryService.getTrainingHours(studentId, startDate, endDate);
      if (Array.isArray(result)) {
        set({ trainingHours: result, loading: false });
      } else {
        set({ trainingHoursSummary: result, trainingHours: result.records, loading: false });
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch training hours',
        loading: false,
      });
    }
  },

  // Log training hours
  logTrainingHours: async (flightId, payload) => {
    set({ loading: true, error: null });
    try {
      const newHours = await flightHistoryService.logTrainingHours(flightId, payload);
      set((state) => ({
        trainingHours: [newHours, ...state.trainingHours],
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to log training hours',
        loading: false,
      });
      throw error;
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Reset store
  reset: () => {
    set({
      history: [],
      notes: [],
      trainingHours: [],
      trainingHoursSummary: null,
      loading: false,
      error: null,
    });
  },
}));

