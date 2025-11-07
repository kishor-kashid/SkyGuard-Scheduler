import { useEffect } from 'react';
import { useFlightsStore } from '../store/flightsStore';
import { FlightFilters } from '../services/flights.service';

export function useFlights(filters?: FlightFilters) {
  const { flights, loading, error, fetchFlights } = useFlightsStore();

  useEffect(() => {
    fetchFlights(filters);
  }, [fetchFlights, JSON.stringify(filters)]);

  return {
    flights,
    loading,
    error,
    refetch: () => fetchFlights(filters),
  };
}

