import { Flight } from '../../types';
import { Card } from '../common/Card';
import { Calendar, MapPin, User, Plane, Cloud, AlertCircle } from 'lucide-react';

interface FlightCardProps {
  flight: Flight;
  onClick?: () => void;
}

export function FlightCard({ flight, onClick }: FlightCardProps) {
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

  const getFlightTypeLabel = (type: string) => {
    switch (type) {
      case 'TRAINING':
        return 'Training';
      case 'SOLO':
        return 'Solo';
      case 'CROSS_COUNTRY':
        return 'Cross Country';
      default:
        return type;
    }
  };

  const latestWeatherCheck = flight.weatherChecks?.[0];
  const hasWeatherIssue = latestWeatherCheck && !latestWeatherCheck.isSafe;

  return (
    <Card 
      className={`cursor-pointer hover:shadow-lg transition-shadow ${onClick ? '' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Flight #{flight.id}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(flight.status)}`}>
              {flight.status.replace('_', ' ')}
            </span>
            {hasWeatherIssue && (
              <div className="flex items-center gap-1 text-yellow-600" title="Weather Alert">
                <AlertCircle className="w-4 h-4" />
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {scheduledDate.toLocaleDateString()} {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="flex items-center gap-1">
              <Plane className="w-4 h-4" />
              {getFlightTypeLabel(flight.flightType)}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {flight.student && (
          <div className="flex items-center gap-2 text-gray-700">
            <User className="w-4 h-4 text-gray-400" />
            <span className="font-medium">Student:</span>
            <span>{flight.student.name}</span>
            {flight.student.trainingLevel && (
              <span className="text-gray-500">({flight.student.trainingLevel.replace('_', ' ')})</span>
            )}
          </div>
        )}

        {flight.instructor && (
          <div className="flex items-center gap-2 text-gray-700">
            <User className="w-4 h-4 text-gray-400" />
            <span className="font-medium">Instructor:</span>
            <span>{flight.instructor.name}</span>
          </div>
        )}

        {flight.aircraft && (
          <div className="flex items-center gap-2 text-gray-700">
            <Plane className="w-4 h-4 text-gray-400" />
            <span className="font-medium">Aircraft:</span>
            <span>{flight.aircraft.tailNumber}</span>
            {flight.aircraft.model && (
              <span className="text-gray-500">({flight.aircraft.model})</span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 text-gray-700">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="font-medium">Route:</span>
          <span>{departure?.name || 'Unknown'}</span>
          {destination && (
            <>
              <span className="text-gray-400">→</span>
              <span>{destination.name}</span>
            </>
          )}
        </div>

        {hasWeatherIssue && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
            <div className="flex items-center gap-1">
              <Cloud className="w-3 h-3" />
              <span className="font-medium">Weather Alert:</span>
            </div>
            <p className="mt-1">{latestWeatherCheck.reason || 'Weather conditions may affect this flight'}</p>
          </div>
        )}
      </div>
    </Card>
  );
}

