import { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { WeatherBriefingCard } from '../components/weather/WeatherBriefingCard';
import { WeatherBriefingModal } from '../components/weather/WeatherBriefingModal';
import { generateCustomBriefing, GenerateCustomBriefingRequest } from '../services/weatherBriefing.service';
import { getAirports } from '../services/airports.service';
import { Airport } from '../types';
import { Loader2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

export function WeatherBriefing() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [briefing, setBriefing] = useState<any>(null);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<GenerateCustomBriefingRequest>({
    location: {
      name: '',
      lat: 0,
      lon: 0,
    },
    dateTime: new Date().toISOString().slice(0, 16),
    trainingLevel: user?.role === 'STUDENT' 
      ? (user as any).trainingLevel || 'STUDENT_PILOT'
      : 'STUDENT_PILOT',
  });

  // Load airports on mount
  useEffect(() => {
    getAirports().then(setAirports).catch(() => {
      // Silently fail - airports are optional
    });
  }, []);

  const handleLocationChange = (airportName: string) => {
    const airport = airports.find(a => a.name === airportName);
    if (airport) {
      setFormData(prev => ({
        ...prev,
        location: {
          name: airport.name,
          lat: airport.lat,
          lon: airport.lon,
        },
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.location.name || !formData.location.lat || !formData.location.lon) {
      toast.error('Please select a location');
      return;
    }

    if (!formData.dateTime) {
      toast.error('Please select a date and time');
      return;
    }

    setLoading(true);
    try {
      // Convert local datetime to ISO string
      const dateTime = new Date(formData.dateTime).toISOString();
      const result = await generateCustomBriefing({
        ...formData,
        dateTime,
      });
      setBriefing(result);
      toast.success('Weather briefing generated successfully');
    } catch (error: any) {
      console.error('Error generating briefing:', error);
      toast.error(error.response?.data?.message || 'Failed to generate weather briefing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Weather Briefing</h1>
        <p className="text-gray-600 mt-1">Generate AI-powered weather briefings for any location and time</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Generate Briefing</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <select
                value={formData.location.name}
                onChange={(e) => handleLocationChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select an airport</option>
                {airports.map((airport) => (
                  <option key={airport.name} value={airport.name}>
                    {airport.name}
                  </option>
                ))}
              </select>
              {formData.location.name && (
                <p className="text-xs text-gray-500 mt-1">
                  Coordinates: {formData.location.lat.toFixed(4)}, {formData.location.lon.toFixed(4)}
                </p>
              )}
            </div>

            {/* Date and Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date & Time
              </label>
              <input
                type="datetime-local"
                value={formData.dateTime}
                onChange={(e) => setFormData(prev => ({ ...prev, dateTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Training Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Training Level
              </label>
              <select
                value={formData.trainingLevel}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  trainingLevel: e.target.value as any 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="STUDENT_PILOT">Student Pilot</option>
                <option value="PRIVATE_PILOT">Private Pilot</option>
                <option value="INSTRUMENT_RATED">Instrument Rated</option>
              </select>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Briefing...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Generate Briefing
                </>
              )}
            </Button>
          </form>
        </Card>

        {/* Briefing Result */}
        <div>
          {briefing ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Briefing Result</h2>
                <Button
                  variant="secondary"
                  className="text-xs py-1.5 px-3"
                  onClick={() => setShowModal(true)}
                >
                  View Full
                </Button>
              </div>
              <WeatherBriefingCard briefing={briefing} compact />
            </div>
          ) : (
            <Card>
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Fill out the form and click "Generate Briefing" to get started
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Full Briefing Modal - Note: This won't work for custom briefings, need to create a custom modal */}
      {briefing && showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Weather Briefing</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ×
              </button>
            </div>
            <WeatherBriefingCard briefing={briefing} />
          </div>
        </div>
      )}
    </div>
  );
}

