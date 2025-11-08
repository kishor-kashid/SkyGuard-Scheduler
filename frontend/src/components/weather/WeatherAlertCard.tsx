import { WeatherAlert } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { AlertTriangle, Calendar, MapPin, Cloud, User, CloudRain } from 'lucide-react';
import { useState } from 'react';
import { WeatherBriefingModal } from './WeatherBriefingModal';

interface WeatherAlertCardProps {
  alert: WeatherAlert;
  onClick?: () => void;
}

export function WeatherAlertCard({ alert, onClick }: WeatherAlertCardProps) {
  const [showBriefingModal, setShowBriefingModal] = useState(false);
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'medium':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'low':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟠';
      default:
        return '⚪';
    }
  };

  const scheduledDate = alert.flight?.scheduledDate 
    ? new Date(alert.flight.scheduledDate) 
    : null;

  const departure = alert.flight?.departureLocation
    ? (typeof alert.flight.departureLocation === 'string'
        ? JSON.parse(alert.flight.departureLocation)
        : alert.flight.departureLocation)
    : null;

  return (
    <Card 
      className={`cursor-pointer hover:shadow-lg transition-shadow border-l-4 ${getSeverityColor(alert.severity)}`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl">
            {getSeverityIcon(alert.severity)}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <h3 className="font-semibold text-gray-900">
              Weather Alert - Flight #{alert.flightId}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
              {alert.severity.toUpperCase()}
            </span>
          </div>

          <p className="text-sm text-gray-700 mb-3">{alert.reason}</p>

          {alert.violations.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-600 mb-1">Violations:</p>
              <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                {alert.violations.map((violation, index) => (
                  <li key={index}>{violation}</li>
                ))}
              </ul>
            </div>
          )}

          {alert.flight && (
            <div className="space-y-1 text-xs text-gray-600">
              {scheduledDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {scheduledDate.toLocaleDateString()} at {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}

              {alert.flight.student && (
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>Student: {alert.flight.student.name}</span>
                </div>
              )}

              {departure && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>Departure: {departure.name || 'Unknown'}</span>
                </div>
              )}
            </div>
          )}

          <div className="mt-3 flex gap-2">
            <Button
              variant="secondary"
              className="text-xs py-1.5 px-3"
              onClick={(e) => {
                e.stopPropagation();
                setShowBriefingModal(true);
              }}
            >
              <CloudRain className="w-4 h-4 mr-1" />
              View Briefing
            </Button>
            {onClick && (
              <Button
                variant="primary"
                className="text-xs py-1.5 px-3"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
              >
                View Flight
              </Button>
            )}
          </div>

          <div className="mt-2 text-xs text-gray-500">
            Alert generated: {new Date(alert.timestamp).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Weather Briefing Modal */}
      {alert.flightId && (
        <WeatherBriefingModal
          isOpen={showBriefingModal}
          onClose={() => setShowBriefingModal(false)}
          flightId={alert.flightId}
        />
      )}
    </Card>
  );
}

