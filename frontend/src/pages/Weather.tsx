import { useState, useEffect } from 'react';
import { useFlightsStore } from '../store/flightsStore';
import { useAuthStore } from '../store/authStore';
import { WeatherAlertList } from '../components/weather/WeatherAlertList';
import { DemoModeToggle } from '../components/weather/DemoModeToggle';
import { WeatherScenarioSelector } from '../components/weather/WeatherScenarioSelector';
import { Card } from '../components/common/Card';
import { Cloud, AlertTriangle } from 'lucide-react';
import { WeatherAlert } from '../types';
import { getDemoScenarios } from '../services/weather.service';

export function Weather() {
  const { flights, fetchFlights } = useFlightsStore();
  const { user } = useAuthStore();
  const [demoModeEnabled, setDemoModeEnabled] = useState(false);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);

  useEffect(() => {
    fetchFlights();
    loadDemoModeStatus();
  }, [fetchFlights]);

  useEffect(() => {
    // Generate weather alerts from flights with weather issues
    const weatherAlerts: WeatherAlert[] = [];
    
    flights.forEach((flight) => {
      const latestWeatherCheck = flight.weatherChecks?.[0];
      if (latestWeatherCheck && !latestWeatherCheck.isSafe) {
        // Determine severity based on flight status and violations
        let severity: 'low' | 'medium' | 'high' = 'medium';
        if (flight.status === 'WEATHER_HOLD') {
          severity = 'high';
        } else if (flight.status === 'CONFIRMED') {
          severity = 'low';
        }

        weatherAlerts.push({
          id: latestWeatherCheck.id,
          flightId: flight.id,
          flight: flight,
          reason: latestWeatherCheck.reason || 'Weather conditions may affect this flight',
          violations: [], // Would need to parse from reason or get from API
          severity,
          timestamp: latestWeatherCheck.checkTimestamp,
          isSafe: false,
        });
      }
    });

    setAlerts(weatherAlerts);
  }, [flights]);

  const loadDemoModeStatus = async () => {
    try {
      const data = await getDemoScenarios();
      setDemoModeEnabled(data.demoModeEnabled);
    } catch (error) {
      console.error('Failed to load demo mode status:', error);
    }
  };

  const handleAlertClick = (alert: WeatherAlert) => {
    // Navigate to flight details or show modal
    console.log('Alert clicked:', alert);
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Weather Monitoring</h1>
          <p className="text-sm text-gray-600 mt-1">Monitor weather conditions and alerts for scheduled flights</p>
        </div>
        {isAdmin && (
          <DemoModeToggle
            initialValue={demoModeEnabled}
            onToggle={setDemoModeEnabled}
          />
        )}
      </div>

      {isAdmin && (
        <WeatherScenarioSelector />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Cloud className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Flights</p>
              <p className="text-2xl font-bold text-gray-900">{flights.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Weather Alerts</p>
              <p className="text-2xl font-bold text-gray-900">{alerts.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Cloud className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Clear Flights</p>
              <p className="text-2xl font-bold text-gray-900">
                {flights.length - alerts.length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Active Weather Alerts">
        <WeatherAlertList
          alerts={alerts}
          onAlertClick={handleAlertClick}
        />
      </Card>
    </div>
  );
}

