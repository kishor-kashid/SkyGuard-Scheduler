import { Flight } from '../../types';
import { FlightCard } from './FlightCard';

interface FlightListProps {
  flights: Flight[];
  onFlightClick?: (flight: Flight) => void;
  loading?: boolean;
}

export function FlightList({ flights, onFlightClick, loading }: FlightListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No flights found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {flights.map((flight) => (
        <FlightCard
          key={flight.id}
          flight={flight}
          onClick={() => onFlightClick?.(flight)}
        />
      ))}
    </div>
  );
}

