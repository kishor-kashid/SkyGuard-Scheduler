import { Airport } from '../../types';
import { Card } from '../common/Card';
import { MapPin } from 'lucide-react';

interface AirportCardProps {
  airport: Airport;
}

export function AirportCard({ airport }: AirportCardProps) {
  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'Major':
        return 'bg-blue-100 text-blue-800';
      case 'Local':
        return 'bg-green-100 text-green-800';
      case 'Cross-Country':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Extract ICAO code from name (e.g., "KAUS" from "Austin-Bergstrom International (KAUS)")
  const icaoMatch = airport.name.match(/\(([A-Z0-9]+)\)/);
  const icaoCode = icaoMatch ? icaoMatch[1] : null;

  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">
              {icaoCode || airport.name.split('(')[0].trim()}
            </h3>
            {airport.category && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(airport.category)}`}>
                {airport.category}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="text-gray-700">
          <span className="font-medium">Name:</span>
          <p className="mt-1">{airport.name.split('(')[0].trim()}</p>
        </div>

        {icaoCode && (
          <div className="flex items-center gap-2 text-gray-700">
            <span className="font-medium">ICAO Code:</span>
            <span className="font-mono">{icaoCode}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-gray-700">
          <span className="font-medium">Coordinates:</span>
          <span className="font-mono text-xs">
            {airport.lat.toFixed(4)}, {airport.lon.toFixed(4)}
          </span>
        </div>
      </div>
    </Card>
  );
}

