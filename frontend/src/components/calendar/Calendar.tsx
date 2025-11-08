import { useState, useMemo } from 'react';
import { Flight } from '../../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '../common/Button';

interface CalendarProps {
  flights: Flight[];
  onFlightClick?: (flight: Flight) => void;
}

export function Calendar({ flights, onFlightClick }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Group flights by date and sort by time
  const flightsByDate = useMemo(() => {
    const grouped: Record<string, Flight[]> = {};
    flights.forEach((flight) => {
      const flightDate = new Date(flight.scheduledDate);
      // Format: YYYY-M-D (month is 0-indexed, so we use it directly)
      const dateKey = `${flightDate.getFullYear()}-${flightDate.getMonth()}-${flightDate.getDate()}`;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(flight);
    });
    // Sort flights by time within each day
    Object.keys(grouped).forEach((key) => {
      grouped[key].sort((a, b) => {
        const dateA = new Date(a.scheduledDate).getTime();
        const dateB = new Date(b.scheduledDate).getTime();
        return dateA - dateB;
      });
    });
    return grouped;
  }, [flights]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-500';
      case 'WEATHER_HOLD':
        return 'bg-yellow-500';
      case 'CANCELLED':
        return 'bg-red-500';
      case 'COMPLETED':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getFlightsForDate = (day: number) => {
    // Match the date key format used in flightsByDate
    const dateKey = `${year}-${month}-${day}`;
    return flightsByDate[dateKey] || [];
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  // Create array of days for the month
  const days = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <CalendarIcon className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-bold text-gray-900">
            {monthNames[month]} {year}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => navigateMonth('prev')}
            className="p-2"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="secondary"
            onClick={goToToday}
            className="px-3 py-1 text-sm"
          >
            Today
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigateMonth('next')}
            className="p-2"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day Names Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-semibold text-gray-600 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const dayFlights = day ? getFlightsForDate(day) : [];
            const isCurrentDay = isToday(day);

            return (
              <div
                key={index}
                className={`min-h-[100px] border border-gray-200 rounded-lg p-1 ${
                  day ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'
                } ${isCurrentDay ? 'ring-2 ring-primary-500' : ''}`}
              >
                {day && (
                  <>
                    <div
                      className={`text-sm font-medium mb-1 ${
                        isCurrentDay
                          ? 'text-primary-700 font-bold'
                          : 'text-gray-700'
                      }`}
                    >
                      {day}
                    </div>
                    <div className="space-y-1">
                      {dayFlights.slice(0, 3).map((flight) => {
                        const scheduledDate = new Date(flight.scheduledDate);
                        const departure =
                          typeof flight.departureLocation === 'string'
                            ? JSON.parse(flight.departureLocation)
                            : flight.departureLocation;

                        return (
                          <div
                            key={flight.id}
                            onClick={() => onFlightClick?.(flight)}
                            className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(
                              flight.status
                            )} text-white truncate`}
                            title={`${scheduledDate.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })} - ${flight.student?.name || 'Unknown'} - ${departure?.name || 'Unknown'}`}
                          >
                            <div className="font-medium truncate">
                              {scheduledDate.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                            <div className="truncate">
                              {flight.student?.name || 'Unknown'}
                            </div>
                          </div>
                        );
                      })}
                      {dayFlights.length > 3 && (
                        <div className="text-xs text-gray-500 text-center py-1">
                          +{dayFlights.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-sm font-medium text-gray-700">Status:</span>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500"></div>
            <span className="text-xs text-gray-600">Confirmed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-yellow-500"></div>
            <span className="text-xs text-gray-600">Weather Hold</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500"></div>
            <span className="text-xs text-gray-600">Cancelled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500"></div>
            <span className="text-xs text-gray-600">Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
}

