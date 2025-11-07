import { useState, useEffect } from 'react';
import { useFlightsStore } from '../store/flightsStore';
import { useAuthStore } from '../store/authStore';
import { FlightList } from '../components/flights/FlightList';
import { FlightDetails } from '../components/flights/FlightDetails';
import { CreateFlightForm } from '../components/flights/CreateFlightForm';
import { Button } from '../components/common/Button';
import { Select } from '../components/common/Select';
import { Flight, FlightStatus } from '../types';
import { Plus, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export function Flights() {
  const { flights, loading, error, fetchFlights, cancelFlight, setSelectedFlight, selectedFlight, triggerWeatherCheck } = useFlightsStore();
  const { user } = useAuthStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    fetchFlights(statusFilter ? { status: statusFilter as FlightStatus } : undefined);
  }, [statusFilter, fetchFlights]);

  const handleFlightClick = (flight: Flight) => {
    setSelectedFlight(flight);
  };

  const handleCloseDetails = () => {
    setSelectedFlight(null);
  };

  const handleCancelFlight = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this flight?')) {
      return;
    }

    try {
      await cancelFlight(id);
      toast.success('Flight cancelled successfully');
      handleCloseDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel flight');
    }
  };

  const handleCheckWeather = async (id: number) => {
    try {
      await triggerWeatherCheck(id);
      toast.success('Weather check completed');
      // Refresh flight data
      fetchFlights(statusFilter ? { status: statusFilter as FlightStatus } : undefined);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to check weather');
    }
  };

  const canCreateFlight = user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR';

  if (selectedFlight) {
    return (
      <div>
        <div className="mb-4">
          <Button variant="secondary" onClick={handleCloseDetails}>
            ← Back to Flights
          </Button>
        </div>
        <FlightDetails
          flight={selectedFlight}
          onClose={handleCloseDetails}
          onCancel={canCreateFlight ? handleCancelFlight : undefined}
          onCheckWeather={handleCheckWeather}
          onRescheduleComplete={() => {
            fetchFlights(statusFilter ? { status: statusFilter as FlightStatus } : undefined);
            handleCloseDetails();
          }}
        />
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <div>
        <div className="mb-4">
          <Button variant="secondary" onClick={() => setShowCreateForm(false)}>
            ← Back to Flights
          </Button>
        </div>
        <CreateFlightForm
          onSuccess={() => {
            setShowCreateForm(false);
            fetchFlights(statusFilter ? { status: statusFilter as FlightStatus } : undefined);
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Flights</h1>
        {canCreateFlight && (
          <Button
            variant="primary"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Flight
          </Button>
        )}
      </div>

      <div className="mb-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-700">Filter by status:</span>
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: '', label: 'All Statuses' },
            { value: 'CONFIRMED', label: 'Confirmed' },
            { value: 'WEATHER_HOLD', label: 'Weather Hold' },
            { value: 'CANCELLED', label: 'Cancelled' },
            { value: 'COMPLETED', label: 'Completed' },
          ]}
          className="w-48"
        />
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      <FlightList
        flights={flights}
        onFlightClick={handleFlightClick}
        loading={loading}
      />
    </div>
  );
}
