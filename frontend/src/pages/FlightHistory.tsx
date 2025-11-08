import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useFlightHistoryStore } from '../store/flightHistoryStore';
import { useAuthStore } from '../store/authStore';
import { useFlightsStore } from '../store/flightsStore';
import { FlightHistoryTimeline } from '../components/flights/FlightHistoryTimeline';
import { StudentHistoryTimeline } from '../components/flights/StudentHistoryTimeline';
import { InstructorHistoryTimeline } from '../components/flights/InstructorHistoryTimeline';
import { FlightNotes } from '../components/flights/FlightNotes';
import { TrainingHoursCard } from '../components/flights/TrainingHoursCard';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { FileText, Calendar, Clock } from 'lucide-react';

export function FlightHistory() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { user } = useAuthStore();
  const { flights } = useFlightsStore();
  const [activeTab, setActiveTab] = useState<'history' | 'notes' | 'hours'>('history');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    flightType: '',
    status: '',
  });

  // Determine if this is a flight ID, student ID, or instructor ID
  const isInstructorRoute = location.pathname.includes('/instructor/');
  const isStudentRoute = !isInstructorRoute && (
    user?.role === 'STUDENT' || 
    location.pathname.includes('/students/') ||
    (user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR') // Admin/Instructor viewing student history
  );
  
  // If it's a student route or user is a student, treat ID as studentId
  // Otherwise, if we have flights and the ID matches a flight, treat as flightId
  // Otherwise, treat as studentId if user is student
  let flightId: number | null = null;
  let studentId: number | null = null;
  let instructorId: number | null = null;
  
  if (isInstructorRoute && id) {
    instructorId = parseInt(id);
  } else if (isStudentRoute && id) {
    // If it's a student route, treat ID as studentId
    studentId = parseInt(id);
  } else if (id) {
    // Check if ID matches a flight ID
    const matchingFlight = flights.find(f => f.id === parseInt(id));
    if (matchingFlight) {
      flightId = parseInt(id);
    } else if (user?.role === 'STUDENT') {
      // If user is student and ID doesn't match a flight, treat as studentId
      studentId = parseInt(id);
    } else if (user?.role === 'INSTRUCTOR' && !isInstructorRoute) {
      // If user is instructor and not on instructor route, they might be viewing student history
      // Instructors can view student history, so treat as studentId
      studentId = parseInt(id);
    } else if (user?.role === 'ADMIN') {
      // Admin can view student history - treat as studentId if not a flight
      studentId = parseInt(id);
    } else {
      // Default: treat as flightId
      flightId = parseInt(id);
    }
  } else if (user?.role === 'STUDENT' && flights.length > 0) {
    // If no ID provided but user is student, use their studentId from flights
    studentId = flights[0].studentId;
  } else if (user?.role === 'INSTRUCTOR' && flights.length > 0) {
    // If no ID provided but user is instructor, use their instructorId from flights
    instructorId = flights[0].instructorId;
  }

  if (!flightId && !studentId && !instructorId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No flight, student, or instructor ID provided</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Flight History</h1>
        <p className="text-gray-600">View flight history, notes, and training hours</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              History
            </div>
          </button>
          {flightId && (
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'notes'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Notes
              </div>
            </button>
          )}
          {studentId && (
            <button
              onClick={() => setActiveTab('hours')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'hours'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Training Hours
              </div>
            </button>
          )}
        </nav>
      </div>

      {/* Filters */}
      {activeTab === 'history' && (
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              type="date"
              label="Start Date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
            <Input
              type="date"
              label="End Date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
            <Select
              label="Flight Type"
              value={filters.flightType}
              onChange={(e) => setFilters({ ...filters, flightType: e.target.value })}
              options={[
                { value: '', label: 'All Types' },
                { value: 'TRAINING', label: 'Training' },
                { value: 'SOLO', label: 'Solo' },
                { value: 'CROSS_COUNTRY', label: 'Cross Country' },
              ]}
            />
            <Select
              label="Status"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'CONFIRMED', label: 'Confirmed' },
                { value: 'CANCELLED', label: 'Cancelled' },
                { value: 'WEATHER_HOLD', label: 'Weather Hold' },
                { value: 'COMPLETED', label: 'Completed' },
              ]}
            />
          </div>
        </Card>
      )}

      {/* Tab Content */}
      <div>
        {activeTab === 'history' && (
          <>
            {flightId && <FlightHistoryTimeline flightId={flightId} />}
            {studentId && !flightId && (
              <StudentHistoryTimeline studentId={studentId} filters={filters} />
            )}
            {instructorId && !flightId && (
              <InstructorHistoryTimeline instructorId={instructorId} filters={filters} />
            )}
          </>
        )}
        {activeTab === 'notes' && flightId && (
          <FlightNotes flightId={flightId} />
        )}
        {activeTab === 'hours' && studentId && (
          <TrainingHoursCard studentId={studentId} showDetails={true} />
        )}
      </div>
    </div>
  );
}

