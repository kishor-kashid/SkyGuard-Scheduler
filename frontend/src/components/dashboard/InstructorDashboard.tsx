import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlightsStore } from '../../store/flightsStore';
import { useAuth } from '../../hooks/useAuth';
import { MetricsCard } from './MetricsCard';
import { FlightList } from '../flights/FlightList';
import { Card } from '../common/Card';
import { Calendar, Users, Clock, AlertCircle } from 'lucide-react';
import { Flight } from '../../types';
import { Link } from 'react-router-dom';
import { Button } from '../common/Button';

export function InstructorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { flights, fetchFlights, loading, setSelectedFlight } = useFlightsStore();
  const [todayFlights, setTodayFlights] = useState<Flight[]>([]);
  const [weekFlights, setWeekFlights] = useState<Flight[]>([]);
  const [uniqueStudents, setUniqueStudents] = useState<Set<number>>(new Set());

  const handleFlightClick = (flight: Flight) => {
    setSelectedFlight(flight);
    navigate('/flights');
  };

  useEffect(() => {
    fetchFlights();
  }, [fetchFlights]);

  useEffect(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);
    
    const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Filter today's flights
    const today = flights.filter(flight => {
      const flightDate = new Date(flight.scheduledDate);
      return flightDate >= todayStart && flightDate < todayEnd && 
             flight.status !== 'CANCELLED';
    }).sort((a, b) => 
      new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
    );

    // Filter this week's flights
    const week = flights.filter(flight => {
      const flightDate = new Date(flight.scheduledDate);
      return flightDate >= todayStart && flightDate <= weekEnd && 
             flight.status !== 'CANCELLED';
    });

    // Get unique students
    const students = new Set(flights.map(f => f.studentId).filter(Boolean));

    setTodayFlights(today);
    setWeekFlights(week);
    setUniqueStudents(students);
  }, [flights]);

  const upcomingFlights = flights.filter(f => {
    const flightDate = new Date(f.scheduledDate);
    return flightDate >= new Date() && 
           f.status !== 'CANCELLED' && 
           f.status !== 'COMPLETED';
  }).length;

  const pendingFlights = flights.filter(f => 
    f.status === 'WEATHER_HOLD' || f.status === 'CONFIRMED'
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Instructor Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {user?.name || user?.email}!</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricsCard
          title="Today's Flights"
          value={todayFlights.length}
          icon={<Calendar className="w-6 h-6" />}
          subtitle="Scheduled today"
        />
        <MetricsCard
          title="This Week"
          value={weekFlights.length}
          icon={<Clock className="w-6 h-6" />}
          subtitle="Next 7 days"
        />
        <MetricsCard
          title="Active Students"
          value={uniqueStudents.size}
          icon={<Users className="w-6 h-6" />}
          subtitle="Assigned students"
        />
        <MetricsCard
          title="Pending Flights"
          value={pendingFlights}
          icon={<AlertCircle className="w-6 h-6" />}
          subtitle="Awaiting action"
        />
      </div>

      {/* Today's Schedule */}
      <Card title="Today's Schedule">
        {todayFlights.length > 0 ? (
          <div className="space-y-4">
            {todayFlights.map(flight => (
              <div key={flight.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <FlightList
                    flights={[flight]}
                    loading={false}
                    onFlightClick={handleFlightClick}
                  />
                </div>
                <Button
                  variant="secondary"
                  className="text-xs py-1.5 px-3"
                  onClick={() => setShowBriefingModal(flight.id)}
                >
                  <CloudRain className="w-4 h-4 mr-1" />
                  Briefing
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No flights scheduled for today</p>
          </div>
        )}
      </Card>

      {/* This Week's Flights */}
      <Card title="This Week's Flights">
        {weekFlights.length > 0 ? (
          <FlightList
            flights={weekFlights.slice(0, 10)}
            loading={loading}
            onFlightClick={handleFlightClick}
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No flights scheduled for this week</p>
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="flex flex-wrap gap-3">
          <Link to="/flights">
            <Button variant="primary">View All Flights</Button>
          </Link>
          <Link to="/weather">
            <Button variant="secondary">Weather Monitoring</Button>
          </Link>
        </div>
      </Card>

    </div>
  );
}

