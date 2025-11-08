import { useEffect, useState } from 'react';
import { useFlightsStore } from '../store/flightsStore';
import { Calendar as CalendarComponent } from '../components/calendar/Calendar';
import { FlightDetails } from '../components/flights/FlightDetails';
import { Flight } from '../types';
import { Button } from '../components/common/Button';
import { Calendar as CalendarIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export function Calendar() {
  const { flights, loading, fetchFlights, fetchFlightById, setSelectedFlight, selectedFlight, triggerWeatherCheck } = useFlightsStore();
  const [selectedFlightForDetails, setSelectedFlightForDetails] = useState<Flight | null>(null);

  useEffect(() => {
    // Fetch all flights for the calendar view
    fetchFlights();
  }, [fetchFlights]);

  // Refresh flights when page becomes visible (e.g., user switches back from another tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchFlights();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchFlights]);

  const handleFlightClick = async (flight: Flight) => {
    try {
      // Fetch full flight details
      await fetchFlightById(flight.id);
      setSelectedFlightForDetails(flight);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load flight details');
    }
  };

  const handleCloseDetails = () => {
    setSelectedFlightForDetails(null);
    setSelectedFlight(null);
  };

  const handleCheckWeather = async (id: number) => {
    try {
      await triggerWeatherCheck(id);
      toast.success('Weather check completed');
      // Refresh flights
      fetchFlights();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to check weather');
    }
  };

  if (selectedFlightForDetails || selectedFlight) {
    const flightToShow = selectedFlightForDetails || selectedFlight;
    return (
      <div>
        <div className="mb-4">
          <Button variant="secondary" onClick={handleCloseDetails}>
            ← Back to Calendar
          </Button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-gray-600">Loading flight details...</span>
          </div>
        ) : (
          flightToShow && (
            <FlightDetails
              flight={flightToShow}
              onClose={handleCloseDetails}
              onCheckWeather={handleCheckWeather}
              onRescheduleComplete={() => {
                fetchFlights();
                handleCloseDetails();
              }}
            />
          )
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <CalendarIcon className="w-6 h-6 text-gray-600" />
          <h1 className="text-2xl font-bold text-gray-900">Flight Calendar</h1>
        </div>
        <p className="text-gray-600">View all flights in a calendar view</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-gray-600">Loading flights...</span>
        </div>
      ) : (
        <CalendarComponent flights={flights} onFlightClick={handleFlightClick} />
      )}
    </div>
  );
}

