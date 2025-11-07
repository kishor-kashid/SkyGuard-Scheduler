import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlightsStore } from '../../store/flightsStore';
import { useAuth } from '../../hooks/useAuth';
import { MetricsCard } from './MetricsCard';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Link } from 'react-router-dom';
import { 
  Plane, 
  AlertTriangle, 
  Users, 
  Calendar, 
  Cloud
} from 'lucide-react';
import { Flight } from '../../types';
import { WeatherAlertList } from '../weather/WeatherAlertList';
import { WeatherAlert } from '../../types';

export function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { flights, fetchFlights, loading, setSelectedFlight } = useFlightsStore();
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const [recentFlights, setRecentFlights] = useState<Flight[]>([]);

  const handleFlightClick = (flight: Flight) => {
    setSelectedFlight(flight);
    navigate('/flights');
  };

  useEffect(() => {
    fetchFlights();
  }, [fetchFlights]);

  useEffect(() => {
    // Generate weather alerts from flights
    const alerts: WeatherAlert[] = [];
    flights.forEach((flight) => {
      const latestWeatherCheck = flight.weatherChecks?.[0];
      if (latestWeatherCheck && !latestWeatherCheck.isSafe) {
        let severity: 'low' | 'medium' | 'high' = 'medium';
        if (flight.status === 'WEATHER_HOLD') {
          severity = 'high';
        } else if (flight.status === 'CONFIRMED') {
          severity = 'low';
        }

        alerts.push({
          id: latestWeatherCheck.id,
          flightId: flight.id,
          flight: flight,
          reason: latestWeatherCheck.reason || 'Weather conditions may affect this flight',
          violations: [],
          severity,
          timestamp: latestWeatherCheck.checkTimestamp,
          isSafe: false,
        });
      }
    });

    // Get recent flights (last 10, sorted by date)
    const recent = [...flights]
      .sort((a, b) => 
        new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
      )
      .slice(0, 10);

    setWeatherAlerts(alerts);
    setRecentFlights(recent);
  }, [flights]);

  const totalFlights = flights.length;
  const activeFlights = flights.filter(f => 
    f.status === 'CONFIRMED' || f.status === 'WEATHER_HOLD'
  ).length;
  const weatherHoldFlights = flights.filter(f => f.status === 'WEATHER_HOLD').length;
  const uniqueStudents = new Set(flights.map(f => f.studentId).filter(Boolean)).size;
  const uniqueInstructors = new Set(flights.map(f => f.instructorId).filter(Boolean)).size;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">System overview and management</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricsCard
          title="Total Flights"
          value={totalFlights}
          icon={<Plane className="w-6 h-6" />}
          subtitle="All time"
        />
        <MetricsCard
          title="Active Flights"
          value={activeFlights}
          icon={<Calendar className="w-6 h-6" />}
          subtitle="Confirmed & Weather Hold"
        />
        <MetricsCard
          title="Weather Alerts"
          value={weatherAlerts.length}
          icon={<AlertTriangle className="w-6 h-6" />}
          subtitle={`${weatherHoldFlights} on hold`}
        />
        <MetricsCard
          title="System Users"
          value={`${uniqueStudents + uniqueInstructors}`}
          icon={<Users className="w-6 h-6" />}
          subtitle={`${uniqueStudents} students, ${uniqueInstructors} instructors`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Weather Alerts */}
        <Card title="Live Weather Alerts">
          {weatherAlerts.length > 0 ? (
            <WeatherAlertList
              alerts={weatherAlerts.slice(0, 5)}
              onAlertClick={(alert) => {
                // TODO: Navigate to flight details or show alert details modal
                // For now, alerts are informational only
              }}
            />
          ) : (
            <div className="text-center py-8">
              <Cloud className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No active weather alerts</p>
            </div>
          )}
        </Card>

        {/* Recent Activity */}
        <Card title="Recent Flight Activity">
          {recentFlights.length > 0 ? (
            <div className="overflow-y-auto max-h-96">
              <div className="space-y-0 divide-y divide-gray-200">
                {recentFlights.map((flight) => {
                  const scheduledDate = new Date(flight.scheduledDate);
                  const departure = typeof flight.departureLocation === 'string' 
                    ? JSON.parse(flight.departureLocation) 
                    : flight.departureLocation;
                  const destination = flight.destinationLocation 
                    ? (typeof flight.destinationLocation === 'string' 
                        ? JSON.parse(flight.destinationLocation) 
                        : flight.destinationLocation)
                    : null;

                  const getStatusColor = (status: string) => {
                    switch (status) {
                      case 'CONFIRMED':
                        return 'bg-green-100 text-green-800';
                      case 'WEATHER_HOLD':
                        return 'bg-yellow-100 text-yellow-800';
                      case 'CANCELLED':
                        return 'bg-red-100 text-red-800';
                      case 'COMPLETED':
                        return 'bg-blue-100 text-blue-800';
                      default:
                        return 'bg-gray-100 text-gray-800';
                    }
                  };

                  const latestWeatherCheck = flight.weatherChecks?.[0];
                  const hasWeatherIssue = latestWeatherCheck && !latestWeatherCheck.isSafe;

                  return (
                    <div
                      key={flight.id}
                      onClick={() => handleFlightClick(flight)}
                      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold text-gray-900">Flight #{flight.id}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(flight.status)}`}>
                              {flight.status.replace('_', ' ')}
                            </span>
                            {hasWeatherIssue && (
                              <AlertTriangle className="w-4 h-4 text-yellow-600" />
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {scheduledDate.toLocaleDateString()} {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {flight.student && (
                              <span className="text-gray-600">
                                Student: {flight.student.name}
                              </span>
                            )}
                            {flight.instructor && (
                              <span className="text-gray-600">
                                Instructor: {flight.instructor.name}
                              </span>
                            )}
                            {departure && (
                              <span className="text-gray-600 truncate">
                                {departure.name}
                                {destination && ` → ${destination.name}`}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No recent flights</p>
            </div>
          )}
        </Card>
      </div>

      {/* Demo Controls */}
      <Card title="Demo Mode Controls">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 mb-4">
            <strong>Demo Mode:</strong> Use pre-built weather scenarios to test the system without real weather API calls.
          </p>
          <Link to="/weather">
            <Button variant="primary">Go to Weather Controls</Button>
          </Link>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="flex flex-wrap gap-3">
          <Link to="/flights">
            <Button variant="primary">Manage Flights</Button>
          </Link>
          <Link to="/weather">
            <Button variant="secondary">Weather Monitoring</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

