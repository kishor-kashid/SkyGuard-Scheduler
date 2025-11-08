import { useEffect } from 'react';
import { useFlightHistoryStore } from '../../store/flightHistoryStore';
import { Card } from '../common/Card';
import { Clock, TrendingUp, BookOpen, Plane, Monitor } from 'lucide-react';

interface TrainingHoursCardProps {
  studentId: number;
  showDetails?: boolean;
}

// Helper function to safely convert hours to a number
function toNumber(value: number | string | any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value) || 0;
  // Handle Decimal objects or other types
  if (value && typeof value === 'object' && 'toNumber' in value) {
    return value.toNumber();
  }
  return Number(value) || 0;
}

export function TrainingHoursCard({ studentId, showDetails = false }: TrainingHoursCardProps) {
  const { trainingHoursSummary, trainingHours, loading, fetchTrainingHours } = useFlightHistoryStore();

  useEffect(() => {
    fetchTrainingHours(studentId);
  }, [studentId]);

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Card>
    );
  }

  const summary = trainingHoursSummary || {
    totalHours: trainingHours.reduce((sum, h) => sum + toNumber(h.hours), 0),
    hoursByCategory: {
      GROUND: trainingHours.filter((h) => h.category === 'GROUND').reduce((sum, h) => sum + toNumber(h.hours), 0),
      FLIGHT: trainingHours.filter((h) => h.category === 'FLIGHT').reduce((sum, h) => sum + toNumber(h.hours), 0),
      SIMULATOR: trainingHours.filter((h) => h.category === 'SIMULATOR').reduce((sum, h) => sum + toNumber(h.hours), 0),
    },
    records: trainingHours.map((h) => ({
      ...h,
      hours: toNumber(h.hours), // Ensure hours is always a number
    })),
    recordCount: trainingHours.length,
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'GROUND':
        return <BookOpen className="w-5 h-5" />;
      case 'FLIGHT':
        return <Plane className="w-5 h-5" />;
      case 'SIMULATOR':
        return <Monitor className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'GROUND':
        return 'bg-blue-100 text-blue-800';
      case 'FLIGHT':
        return 'bg-green-100 text-green-800';
      case 'SIMULATOR':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Training Hours</h3>
        <div className="flex items-center gap-2 text-2xl font-bold text-blue-600">
          <Clock className="w-6 h-6" />
          <span>{toNumber(summary.totalHours).toFixed(1)}</span>
        </div>
      </div>

      {/* Summary by Category */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {Object.entries(summary.hoursByCategory).map(([category, hours]) => (
          <div
            key={category}
            className={`p-4 rounded-lg ${getCategoryColor(category)} flex items-center gap-3`}
          >
            {getCategoryIcon(category)}
            <div>
              <p className="text-xs font-medium opacity-75">{category}</p>
              <p className="text-lg font-bold">{toNumber(hours).toFixed(1)}h</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Records */}
      {showDetails && summary.records.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Recent Hours</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {summary.records.slice(0, 10).map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  {getCategoryIcon(record.category)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {toNumber(record.hours).toFixed(1)} hours
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(record.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(record.category)}`}>
                  {record.category}
                </span>
              </div>
            ))}
          </div>
          {summary.recordCount > 10 && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              Showing 10 of {summary.recordCount} records
            </p>
          )}
        </div>
      )}

      {summary.recordCount === 0 && (
        <div className="text-center py-4 text-gray-500">
          <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No training hours logged yet</p>
        </div>
      )}
    </Card>
  );
}

