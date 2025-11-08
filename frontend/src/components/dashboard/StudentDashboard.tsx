import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlightsStore } from '../../store/flightsStore';
import { useAuth } from '../../hooks/useAuth';
import { MetricsCard } from './MetricsCard';
import { FlightList } from '../flights/FlightList';
import { Card } from '../common/Card';
import { Calendar, AlertTriangle, Plane, TrendingUp, Clock } from 'lucide-react';
import { Flight } from '../../types';
import { Link } from 'react-router-dom';
import { Button } from '../common/Button';
import { TrainingHoursCard } from '../flights/TrainingHoursCard';

export function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { flights, fetchFlights, loading, setSelectedFlight } = useFlightsStore();
  const [upcomingFlights, setUpcomingFlights] = useState<Flight[]>([]);
  const [weatherAlerts, setWeatherAlerts] = useState<Flight[]>([]);

  const handleFlightClick = (flight: Flight) => {
    setSelectedFlight(flight);
    navigate('/flights');
  };

  useEffect(() => {
    fetchFlights();
  }, [fetchFlights]);

  useEffect(() => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Filter upcoming flights (next 7 days)
    const upcoming = flights.filter(flight => {
      const flightDate = new Date(flight.scheduledDate);
      return flightDate >= now && flightDate <= nextWeek && 
             flight.status !== 'CANCELLED' && 
             flight.status !== 'COMPLETED';
    }).sort((a, b) => 
      new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
    );

    // Filter flights with weather alerts
    const alerts = flights.filter(flight => {
      const latestWeatherCheck = flight.weatherChecks?.[0];
      return latestWeatherCheck && !latestWeatherCheck.isSafe && 
             flight.status !== 'CANCELLED' && 
             flight.status !== 'COMPLETED';
    });

    setUpcomingFlights(upcoming);
    setWeatherAlerts(alerts);
  }, [flights]);


  const completedFlights = flights.filter(f => f.status === 'COMPLETED').length;
  const totalFlights = flights.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {user?.name || user?.email}!</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricsCard
          title="Upcoming Flights"
          value={upcomingFlights.length}
          icon={<Calendar className="w-6 h-6" />}
          subtitle="Next 7 days"
        />
        <MetricsCard
          title="Weather Alerts"
          value={weatherAlerts.length}
          icon={<AlertTriangle className="w-6 h-6" />}
          subtitle="Active alerts"
        />
        <MetricsCard
          title="Completed Flights"
          value={completedFlights}
          icon={<Plane className="w-6 h-6" />}
          subtitle={`${totalFlights} total`}
        />
        <MetricsCard
          title="Training Progress"
          value={`${totalFlights > 0 ? Math.round((completedFlights / totalFlights) * 100) : 0}%`}
          icon={<TrendingUp className="w-6 h-6" />}
          subtitle="Completion rate"
        />
      </div>

      {/* Upcoming Flights */}
      <Card title="Upcoming Flights">
        {upcomingFlights.length > 0 ? (
          <FlightList
            flights={upcomingFlights.slice(0, 5)}
            loading={loading}
            onFlightClick={handleFlightClick}
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No upcoming flights scheduled</p>
            <Link to="/flights">
              <Button variant="primary">View All Flights</Button>
            </Link>
          </div>
        )}
      </Card>

      {/* Weather Alerts */}
      {weatherAlerts.length > 0 && (
        <Card title="Weather Alerts">
          <div className="space-y-3">
            {weatherAlerts.slice(0, 5).map(flight => {
              const latestWeatherCheck = flight.weatherChecks?.[0];
              return (
                <div
                  key={flight.id}
                  className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">
                        Flight #{flight.id} - {new Date(flight.scheduledDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-700 mt-1">
                        {latestWeatherCheck?.reason || 'Weather conditions may affect this flight'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/flights`}>
                        <Button variant="secondary" className="text-xs py-1.5 px-3">Details</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Training Hours Summary */}
      {flights.length > 0 && flights[0].studentId && (
        <TrainingHoursCard studentId={flights[0].studentId} showDetails={false} />
      )}

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="flex flex-wrap gap-3">
          <Link to="/flights">
            <Button variant="primary">View All Flights</Button>
          </Link>
          <Link to="/weather">
            <Button variant="secondary">Check Weather</Button>
          </Link>
        </div>
      </Card>

    </div>
  );
}

