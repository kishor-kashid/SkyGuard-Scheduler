import { create } from 'zustand';
import { Flight } from '../types';
import * as flightsService from '../services/flights.service';
import { FlightFilters } from '../services/flights.service';

interface FlightsStore {
  flights: Flight[];
  selectedFlight: Flight | null;
  loading: boolean;
  error: string | null;
  fetchFlights: (filters?: FlightFilters) => Promise<void>;
  fetchFlightById: (id: number) => Promise<void>;
  createFlight: (payload: flightsService.CreateFlightPayload) => Promise<Flight>;
  updateFlight: (id: number, payload: flightsService.UpdateFlightPayload) => Promise<void>;
  cancelFlight: (id: number) => Promise<void>;
  triggerWeatherCheck: (id: number) => Promise<void>;
  setSelectedFlight: (flight: Flight | null) => void;
  clearError: () => void;
}

export const useFlightsStore = create<FlightsStore>((set, get) => ({
  flights: [],
  selectedFlight: null,
  loading: false,
  error: null,

  fetchFlights: async (filters) => {
    set({ loading: true, error: null });
    try {
      const flights = await flightsService.getFlights(filters);
      set({ flights, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch flights',
        loading: false,
      });
    }
  },

  fetchFlightById: async (id) => {
    set({ loading: true, error: null });
    try {
      const flight = await flightsService.getFlightById(id);
      set({ selectedFlight: flight, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch flight',
        loading: false,
      });
    }
  },

  createFlight: async (payload) => {
    set({ loading: true, error: null });
    try {
      const newFlight = await flightsService.createFlight(payload);
      set((state) => ({
        flights: [newFlight, ...state.flights],
        loading: false,
      }));
      return newFlight;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to create flight',
        loading: false,
      });
      throw error;
    }
  },

  updateFlight: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      const updatedFlight = await flightsService.updateFlight(id, payload);
      set((state) => ({
        flights: state.flights.map((f) => (f.id === id ? updatedFlight : f)),
        selectedFlight: state.selectedFlight?.id === id ? updatedFlight : state.selectedFlight,
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to update flight',
        loading: false,
      });
      throw error;
    }
  },

  cancelFlight: async (id) => {
    set({ loading: true, error: null });
    try {
      await flightsService.cancelFlight(id);
      set((state) => ({
        flights: state.flights.filter((f) => f.id !== id),
        selectedFlight: state.selectedFlight?.id === id ? null : state.selectedFlight,
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to cancel flight',
        loading: false,
      });
      throw error;
    }
  },

  triggerWeatherCheck: async (id) => {
    set({ loading: true, error: null });
    try {
      await flightsService.triggerWeatherCheck(id);
      // Refresh the flight data
      const flight = await flightsService.getFlightById(id);
      set((state) => ({
        flights: state.flights.map((f) => (f.id === id ? flight : f)),
        selectedFlight: state.selectedFlight?.id === id ? flight : state.selectedFlight,
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to check weather',
        loading: false,
      });
      throw error;
    }
  },

  setSelectedFlight: (flight) => {
    set({ selectedFlight: flight });
  },

  clearError: () => {
    set({ error: null });
  },
}));

