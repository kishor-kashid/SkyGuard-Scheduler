import { useEffect } from 'react';
import { useFlightHistoryStore } from '../../store/flightHistoryStore';
import { Card } from '../common/Card';
import { Clock, User, FileText, AlertCircle, CheckCircle, XCircle, RefreshCw, Calendar, Plane } from 'lucide-react';
import { Link } from 'react-router-dom';

interface InstructorHistoryTimelineProps {
  instructorId: number;
  filters?: {
    startDate?: string;
    endDate?: string;
    flightType?: string;
    status?: string;
  };
}

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

export function InstructorHistoryTimeline({ instructorId, filters }: InstructorHistoryTimelineProps) {
  const { history, loading, error, fetchInstructorHistory } = useFlightHistoryStore();

  useEffect(() => {
    fetchInstructorHistory(instructorId);
  }, [instructorId]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'UPDATED':
        return <RefreshCw className="w-5 h-5 text-blue-600" />;
      case 'CANCELLED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'RESCHEDULED':
        return <Calendar className="w-5 h-5 text-orange-600" />;
      case 'STATUS_CHANGED':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATED':
        return 'bg-green-100 border-green-300';
      case 'UPDATED':
        return 'bg-blue-100 border-blue-300';
      case 'CANCELLED':
        return 'bg-red-100 border-red-300';
      case 'COMPLETED':
        return 'bg-blue-100 border-blue-300';
      case 'RESCHEDULED':
        return 'bg-orange-100 border-orange-300';
      case 'STATUS_CHANGED':
        return 'bg-yellow-100 border-yellow-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  const formatAction = (action: string) => {
    return action.replace('_', ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const parseChanges = (changes: string | null | undefined) => {
    if (!changes) return null;
    try {
      return JSON.parse(changes);
    } catch {
      return null;
    }
  };

  // Apply filters
  let filteredHistory = history;
  if (filters) {
    filteredHistory = history.filter((item) => {
      if (filters.startDate) {
        const itemDate = new Date(item.timestamp);
        const startDate = new Date(filters.startDate);
        if (itemDate < startDate) return false;
      }
      if (filters.endDate) {
        const itemDate = new Date(item.timestamp);
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999); // Include entire end date
        if (itemDate > endDate) return false;
      }
      if (filters.flightType && item.flight) {
        // Note: flightType is not directly in history, would need to fetch flight details
        // For now, we'll skip this filter or implement it if flight data is available
      }
      if (filters.status && item.flight) {
        if (item.flight.status !== filters.status) return false;
      }
      return true;
    });
  }

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="text-red-600 text-center py-4">{error}</div>
      </Card>
    );
  }

  if (filteredHistory.length === 0) {
    return (
      <Card>
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>No history available for this instructor</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructor Flight History</h3>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        <div className="space-y-4">
          {filteredHistory.map((item, index) => {
            const changes = parseChanges(item.changes);
            const timestamp = new Date(item.timestamp);

            return (
              <div key={item.id} className="relative flex items-start gap-4">
                {/* Icon */}
                <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 ${getActionColor(item.action)}`}>
                  {getActionIcon(item.action)}
                </div>

                {/* Content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">{formatAction(item.action)}</span>
                    <span className="text-sm text-gray-500">
                      {formatTimeAgo(timestamp)}
                    </span>
                  </div>

                  {/* Flight Info */}
                  {item.flight && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Plane className="w-4 h-4" />
                      <Link 
                        to={`/flights`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                        onClick={(e) => {
                          e.preventDefault();
                          // Could navigate to flight details or trigger flight selection
                          window.location.href = `/flights`;
                        }}
                      >
                        Flight #{item.flight.id}
                      </Link>
                      {item.flight.scheduledDate && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span>{new Date(item.flight.scheduledDate).toLocaleDateString()}</span>
                        </>
                      )}
                      {item.flight.status && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span className="capitalize">{item.flight.status.replace('_', ' ').toLowerCase()}</span>
                        </>
                      )}
                    </div>
                  )}

                  {item.changedByUser && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <User className="w-4 h-4" />
                      <span>{item.changedByUser.email}</span>
                      <span className="text-gray-400">•</span>
                      <span className="capitalize">{item.changedByUser.role.toLowerCase()}</span>
                    </div>
                  )}

                  {item.notes && (
                    <p className="text-sm text-gray-700 mb-2">{item.notes}</p>
                  )}

                  {changes && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="space-y-1 text-sm">
                        {Object.entries(changes).map(([key, value]: [string, any]) => {
                          if (typeof value === 'object' && value !== null && 'old' in value && 'new' in value) {
                            return (
                              <div key={key} className="flex items-start gap-2">
                                <span className="font-medium text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                <div className="flex-1">
                                  <span className="text-red-600 line-through">{String(value.old)}</span>
                                  <span className="mx-2">→</span>
                                  <span className="text-green-600 font-medium">{String(value.new)}</span>
                                </div>
                              </div>
                            );
                          }
                          return (
                            <div key={key}>
                              <span className="font-medium text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                              <span className="ml-2 text-gray-600">{String(value)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
                    <Clock className="w-3 h-3" />
                    <span>{timestamp.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

