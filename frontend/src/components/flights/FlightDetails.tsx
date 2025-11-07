import { useState } from 'react';
import { Flight } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Calendar, MapPin, User, Plane, Cloud, AlertCircle, X, RefreshCw } from 'lucide-react';
import { RescheduleOptionsModal } from '../reschedule/RescheduleOptionsModal';
import { useAuthStore } from '../../store/authStore';

interface FlightDetailsProps {
  flight: Flight;
  onClose?: () => void;
  onCancel?: (id: number) => void;
  onCheckWeather?: (id: number) => void;
  onRescheduleComplete?: () => void;
}

export function FlightDetails({ flight, onClose, onCancel, onCheckWeather, onRescheduleComplete }: FlightDetailsProps) {
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const { user } = useAuthStore();
  
  const scheduledDate = new Date(flight.scheduledDate);
  const departure = typeof flight.departureLocation === 'string' 
    ? JSON.parse(flight.departureLocation) 
    : flight.departureLocation;
  const destination = flight.destinationLocation 
    ? (typeof flight.destinationLocation === 'string' 
        ? JSON.parse(flight.destinationLocation) 
        : flight.destinationLocation)
    : null;

  const latestWeatherCheck = flight.weatherChecks?.[0];
  const hasWeatherIssue = latestWeatherCheck && !latestWeatherCheck.isSafe;
  
  // Only students can reschedule (backend already filters flights so students only see their own)
  const isStudent = user?.role === 'STUDENT';
  const canReschedule = isStudent && hasWeatherIssue && 
    flight.status !== 'CANCELLED' && 
    flight.status !== 'COMPLETED';

  return (
    <Card className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Flight Details</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Status and Type */}
        <div className="flex items-center gap-4">
          <div>
            <span className="text-sm text-gray-500">Status</span>
            <p className="text-lg font-semibold text-gray-900">{flight.status.replace('_', ' ')}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Type</span>
            <p className="text-lg font-semibold text-gray-900">{flight.flightType.replace('_', ' ')}</p>
          </div>
        </div>

        {/* Date and Time */}
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <div>
            <span className="text-sm text-gray-500">Scheduled Date & Time</span>
            <p className="text-lg font-semibold text-gray-900">
              {scheduledDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p className="text-gray-600">{scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>

        {/* Route */}
        <div className="flex items-start gap-2">
          <MapPin className="w-5 h-5 text-gray-400 mt-1" />
          <div className="flex-1">
            <span className="text-sm text-gray-500">Route</span>
            <div className="mt-1">
              <p className="font-semibold text-gray-900">{departure?.name || 'Unknown'}</p>
              {destination && (
                <>
                  <span className="text-gray-400 mx-2">→</span>
                  <p className="font-semibold text-gray-900 inline">{destination.name}</p>
                </>
              )}
            </div>
            {departure?.lat && departure?.lon && (
              <p className="text-xs text-gray-500 mt-1">
                Coordinates: {departure.lat.toFixed(4)}, {departure.lon.toFixed(4)}
              </p>
            )}
          </div>
        </div>

        {/* Student */}
        {flight.student && (
          <div className="flex items-start gap-2">
            <User className="w-5 h-5 text-gray-400 mt-1" />
            <div>
              <span className="text-sm text-gray-500">Student</span>
              <p className="font-semibold text-gray-900">{flight.student.name}</p>
              {flight.student.trainingLevel && (
                <p className="text-sm text-gray-600">{flight.student.trainingLevel.replace('_', ' ')}</p>
              )}
            </div>
          </div>
        )}

        {/* Instructor */}
        {flight.instructor && (
          <div className="flex items-start gap-2">
            <User className="w-5 h-5 text-gray-400 mt-1" />
            <div>
              <span className="text-sm text-gray-500">Instructor</span>
              <p className="font-semibold text-gray-900">{flight.instructor.name}</p>
            </div>
          </div>
        )}

        {/* Aircraft */}
        {flight.aircraft && (
          <div className="flex items-start gap-2">
            <Plane className="w-5 h-5 text-gray-400 mt-1" />
            <div>
              <span className="text-sm text-gray-500">Aircraft</span>
              <p className="font-semibold text-gray-900">{flight.aircraft.tailNumber}</p>
              {flight.aircraft.model && (
                <p className="text-sm text-gray-600">{flight.aircraft.model}</p>
              )}
            </div>
          </div>
        )}

        {/* Weather Status */}
        {latestWeatherCheck && (
          <div className={`p-4 rounded-lg border ${
            hasWeatherIssue 
              ? 'bg-yellow-50 border-yellow-200' 
              : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Cloud className={`w-5 h-5 ${hasWeatherIssue ? 'text-yellow-600' : 'text-green-600'}`} />
              <span className="font-semibold text-gray-900">Weather Check</span>
            </div>
            <p className="text-sm text-gray-700">
              {hasWeatherIssue ? (
                <>
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  {latestWeatherCheck.reason || 'Weather conditions may affect this flight'}
                </>
              ) : (
                'Weather conditions are safe for this flight'
              )}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Last checked: {new Date(latestWeatherCheck.checkTimestamp).toLocaleString()}
            </p>
          </div>
        )}

        {/* Notes */}
        {flight.notes && (
          <div>
            <span className="text-sm text-gray-500">Notes</span>
            <p className="mt-1 text-gray-700">{flight.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          {canReschedule && (
            <Button
              variant="primary"
              onClick={() => setShowRescheduleModal(true)}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              View Reschedule Options
            </Button>
          )}
          {onCheckWeather && (
            <Button
              variant="secondary"
              onClick={() => onCheckWeather(flight.id)}
            >
              <Cloud className="w-4 h-4 mr-2" />
              Check Weather
            </Button>
          )}
          {onCancel && flight.status !== 'CANCELLED' && flight.status !== 'COMPLETED' && (
            <Button
              variant="danger"
              onClick={() => onCancel(flight.id)}
            >
              Cancel Flight
            </Button>
          )}
        </div>
      </div>

      {/* Reschedule Options Modal */}
      <RescheduleOptionsModal
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        flightId={flight.id}
        onRescheduleComplete={() => {
          onRescheduleComplete?.();
          setShowRescheduleModal(false);
        }}
      />
    </Card>
  );
}

