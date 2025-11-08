import { Aircraft } from '../../types';
import { Card } from '../common/Card';
import { Plane, Calendar } from 'lucide-react';

interface AircraftCardProps {
  aircraft: Aircraft;
  onClick?: () => void;
}

export function AircraftCard({ aircraft, onClick }: AircraftCardProps) {
  return (
    <Card 
      className={`${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Plane className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">
              {aircraft.tailNumber}
            </h3>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-700">
          <span className="font-medium">Model:</span>
          <span>{aircraft.model}</span>
        </div>

        {aircraft.type && (
          <div className="flex items-center gap-2 text-gray-700">
            <span className="font-medium">Type:</span>
            <span>{aircraft.type}</span>
          </div>
        )}

        {aircraft.flightCount !== undefined && (
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="font-medium">Total Flights:</span>
            <span>{aircraft.flightCount}</span>
          </div>
        )}
      </div>
    </Card>
  );
}

