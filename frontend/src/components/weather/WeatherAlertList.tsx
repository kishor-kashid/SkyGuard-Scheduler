import { WeatherAlert } from '../../types';
import { WeatherAlertCard } from './WeatherAlertCard';

interface WeatherAlertListProps {
  alerts: WeatherAlert[];
  onAlertClick?: (alert: WeatherAlert) => void;
  loading?: boolean;
}

export function WeatherAlertList({ alerts, onAlertClick, loading }: WeatherAlertListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No weather alerts at this time.</p>
        <p className="text-sm text-gray-400 mt-2">All flights are clear of weather conflicts.</p>
      </div>
    );
  }

  // Sort alerts by severity (high -> medium -> low)
  const sortedAlerts = [...alerts].sort((a, b) => {
    const severityOrder = { high: 3, medium: 2, low: 1 };
    return (severityOrder[b.severity as keyof typeof severityOrder] || 0) - 
           (severityOrder[a.severity as keyof typeof severityOrder] || 0);
  });

  return (
    <div className="space-y-4">
      {sortedAlerts.map((alert) => (
        <WeatherAlertCard
          key={alert.id}
          alert={alert}
          onClick={() => onAlertClick?.(alert)}
        />
      ))}
    </div>
  );
}

