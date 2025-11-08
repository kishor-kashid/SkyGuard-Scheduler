import { useEffect, useState } from 'react';
import { getAircraft } from '../services/aircraft.service';
import { getAirports } from '../services/airports.service';
import { Aircraft, Airport } from '../types';
import { AircraftCard } from '../components/aircraft/AircraftCard';
import { AirportCard } from '../components/airports/AirportCard';
import { Card } from '../components/common/Card';
import { Plane, MapPin, Search } from 'lucide-react';
import { Input } from '../components/common/Input';
import toast from 'react-hot-toast';

export function Resources() {
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [filteredAircraft, setFilteredAircraft] = useState<Aircraft[]>([]);
  const [filteredAirports, setFilteredAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(true);
  const [aircraftSearchTerm, setAircraftSearchTerm] = useState('');
  const [airportSearchTerm, setAirportSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'aircraft' | 'airports'>('aircraft');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Filter aircraft based on search term
    if (!aircraftSearchTerm.trim()) {
      setFilteredAircraft(aircraft);
    } else {
      const filtered = aircraft.filter(
        (ac) =>
          ac.tailNumber.toLowerCase().includes(aircraftSearchTerm.toLowerCase()) ||
          ac.model.toLowerCase().includes(aircraftSearchTerm.toLowerCase()) ||
          ac.type?.toLowerCase().includes(aircraftSearchTerm.toLowerCase())
      );
      setFilteredAircraft(filtered);
    }
  }, [aircraftSearchTerm, aircraft]);

  useEffect(() => {
    // Filter airports based on search term
    if (!airportSearchTerm.trim()) {
      setFilteredAirports(airports);
    } else {
      const filtered = airports.filter(
        (ap) =>
          ap.name.toLowerCase().includes(airportSearchTerm.toLowerCase()) ||
          ap.category?.toLowerCase().includes(airportSearchTerm.toLowerCase())
      );
      setFilteredAirports(filtered);
    }
  }, [airportSearchTerm, airports]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [aircraftData, airportsData] = await Promise.all([
        getAircraft(),
        getAirports(),
      ]);
      setAircraft(aircraftData);
      setFilteredAircraft(aircraftData);
      setAirports(airportsData);
      setFilteredAirports(airportsData);
    } catch (error: any) {
      console.error('Failed to load resources:', error);
      toast.error(error.response?.data?.message || 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const aircraftByType = aircraft.reduce((acc, ac) => {
    const type = ac.type || 'Unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const airportsByCategory = airports.reduce((acc, ap) => {
    const category = ap.category || 'Unknown';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
        <p className="text-gray-600 mt-1">Manage aircraft and airports</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('aircraft')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'aircraft'
              ? 'text-primary-700 border-b-2 border-primary-700'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Plane className="w-4 h-4 inline mr-2" />
          Aircraft ({aircraft.length})
        </button>
        <button
          onClick={() => setActiveTab('airports')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'airports'
              ? 'text-primary-700 border-b-2 border-primary-700'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <MapPin className="w-4 h-4 inline mr-2" />
          Airports ({airports.length})
        </button>
      </div>

      {/* Aircraft Tab */}
      {activeTab === 'aircraft' && (
        <div className="space-y-6">
          {/* Search Bar */}
          <Card>
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by tail number, model, or type..."
                value={aircraftSearchTerm}
                onChange={(e) => setAircraftSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Plane className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Aircraft</p>
                  <p className="text-2xl font-bold text-gray-900">{aircraft.length}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Plane className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Single Engine</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {aircraftByType['Single Engine'] || 0}
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Plane className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Flight Hours</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {aircraft.reduce((sum, ac) => sum + (ac.flightCount || 0), 0)}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Aircraft List */}
          {loading ? (
            <Card>
              <div className="text-center py-12">
                <p className="text-gray-500">Loading aircraft...</p>
              </div>
            </Card>
          ) : filteredAircraft.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAircraft.map((ac) => (
                <AircraftCard key={ac.id} aircraft={ac} />
              ))}
            </div>
          ) : (
            <Card>
              <div className="text-center py-12">
                <Plane className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {aircraftSearchTerm ? 'No aircraft found matching your search.' : 'No aircraft found.'}
                </p>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Airports Tab */}
      {activeTab === 'airports' && (
        <div className="space-y-6">
          {/* Search Bar */}
          <Card>
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name, ICAO code, or category..."
                value={airportSearchTerm}
                onChange={(e) => setAirportSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Airports</p>
                  <p className="text-2xl font-bold text-gray-900">{airports.length}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Major</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {airportsByCategory['Major'] || 0}
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MapPin className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Local</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {airportsByCategory['Local'] || 0}
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cross-Country</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {airportsByCategory['Cross-Country'] || 0}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Airports List */}
          {loading ? (
            <Card>
              <div className="text-center py-12">
                <p className="text-gray-500">Loading airports...</p>
              </div>
            </Card>
          ) : filteredAirports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAirports.map((airport, index) => (
                <AirportCard key={index} airport={airport} />
              ))}
            </div>
          ) : (
            <Card>
              <div className="text-center py-12">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {airportSearchTerm ? 'No airports found matching your search.' : 'No airports found.'}
                </p>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

