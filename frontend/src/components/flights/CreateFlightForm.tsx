import { useState, FormEvent, useEffect } from 'react';
import { useFlightsStore } from '../../store/flightsStore';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Card } from '../common/Card';
import { CreateFlightPayload } from '../../types';
import { getStudents } from '../../services/students.service';
import { getInstructors } from '../../services/instructors.service';
import { getAircraft } from '../../services/aircraft.service';
import { Student, Instructor, Aircraft } from '../../types';
import toast from 'react-hot-toast';

interface CreateFlightFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}


const COMMON_AIRPORTS = [
  // Major Airports
  { name: 'Austin-Bergstrom International (KAUS)', lat: 30.1945, lon: -97.6699 },
  { name: 'San Antonio International (KSAT)', lat: 29.5337, lon: -98.4697 },
  { name: 'Dallas Love Field (KDAL)', lat: 32.8471, lon: -96.8518 },
  { name: 'Houston Hobby (KHOU)', lat: 29.6454, lon: -95.2789 },
  { name: 'Dallas/Fort Worth International (KDFW)', lat: 32.8998, lon: -97.0403 },
  { name: 'Houston Intercontinental (KIAH)', lat: 29.9844, lon: -95.3414 },
  
  // Local Airports (near Austin)
  { name: 'Georgetown Municipal (KGTU)', lat: 30.6786, lon: -97.6794 },
  { name: 'San Marcos Municipal (KHYI)', lat: 29.8928, lon: -97.8631 },
  { name: 'New Braunfels Municipal (KBAZ)', lat: 29.7042, lon: -98.0417 },
  { name: 'Temple Municipal (KTPL)', lat: 31.1525, lon: -97.4078 },
  
  // Cross-Country Airports
  { name: 'Waco Regional (KACT)', lat: 31.6113, lon: -97.2303 },
  { name: 'College Station Easterwood (KCLL)', lat: 30.5886, lon: -96.3639 },
  { name: 'Corpus Christi International (KCRP)', lat: 27.7704, lon: -97.5012 },
  { name: 'Midland International (KMAF)', lat: 31.9425, lon: -102.2019 },
  { name: 'Lubbock Preston Smith (KLBB)', lat: 33.6636, lon: -101.8228 },
  { name: 'El Paso International (KELP)', lat: 31.8072, lon: -106.3776 },
];

export function CreateFlightForm({ onSuccess, onCancel }: CreateFlightFormProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateFlightPayload>>({
    studentId: undefined,
    instructorId: undefined,
    aircraftId: undefined,
    scheduledDate: '',
    departureLocation: undefined,
    destinationLocation: undefined,
    flightType: 'TRAINING',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [departureAirport, setDepartureAirport] = useState('');
  const [destinationAirport, setDestinationAirport] = useState('');

  const { createFlight } = useFlightsStore();
  const { user } = useAuthStore();

  useEffect(() => {
    // Load students, instructors, and aircraft if admin or instructor
    if (user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR') {
      loadStudents();
      loadInstructors();
      loadAircraft();
    }
  }, [user]);

  const loadStudents = async () => {
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (error) {
      console.error('Failed to load students:', error);
    }
  };

  const loadInstructors = async () => {
    try {
      const data = await getInstructors();
      setInstructors(data);
    } catch (error) {
      console.error('Failed to load instructors:', error);
    }
  };

  const loadAircraft = async () => {
    try {
      const data = await getAircraft();
      setAircraft(data);
    } catch (error) {
      console.error('Failed to load aircraft:', error);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.studentId) newErrors.studentId = 'Student is required';
    if (!formData.instructorId) newErrors.instructorId = 'Instructor is required';
    if (!formData.aircraftId) newErrors.aircraftId = 'Aircraft is required';
    if (!formData.scheduledDate) newErrors.scheduledDate = 'Scheduled date is required';
    if (!departureAirport) newErrors.departureLocation = 'Departure location is required';

    const scheduledDate = formData.scheduledDate ? new Date(formData.scheduledDate) : null;
    if (scheduledDate && scheduledDate < new Date()) {
      newErrors.scheduledDate = 'Scheduled date must be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getAirportCoordinates = (airportName: string) => {
    const airport = COMMON_AIRPORTS.find(a => a.name === airportName);
    if (airport) {
      return { name: airport.name, lat: airport.lat, lon: airport.lon };
    }
    // Fallback: parse coordinates if provided in format "Name (lat, lon)"
    const match = airportName.match(/\((-?\d+\.?\d*),\s*(-?\d+\.?\d*)\)/);
    if (match) {
      return {
        name: airportName.split('(')[0].trim(),
        lat: parseFloat(match[1]),
        lon: parseFloat(match[2]),
      };
    }
    // Default to Austin if not found
    return { name: airportName, lat: 30.1945, lon: -97.6699 };
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const payload: CreateFlightPayload = {
        studentId: formData.studentId!,
        instructorId: formData.instructorId!,
        aircraftId: formData.aircraftId!,
        scheduledDate: formData.scheduledDate!,
        departureLocation: getAirportCoordinates(departureAirport),
        destinationLocation: destinationAirport ? getAirportCoordinates(destinationAirport) : undefined,
        flightType: formData.flightType!,
        notes: formData.notes || undefined,
      };

      await createFlight(payload);
      toast.success('Flight created successfully!');
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create flight');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Create New Flight">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Student"
          value={formData.studentId?.toString() || ''}
          onChange={(e) => setFormData({ ...formData, studentId: parseInt(e.target.value) })}
          error={errors.studentId}
          options={[
            { value: '', label: 'Select a student' },
            ...students.map(s => ({ value: s.id.toString(), label: `${s.name} (${s.trainingLevel.replace('_', ' ')})` })),
          ]}
        />

        <Select
          label="Instructor"
          value={formData.instructorId?.toString() || ''}
          onChange={(e) => setFormData({ ...formData, instructorId: parseInt(e.target.value) })}
          error={errors.instructorId}
          options={[
            { value: '', label: 'Select an instructor' },
            ...instructors.map(i => ({ value: i.id.toString(), label: i.name })),
          ]}
        />

        <Select
          label="Aircraft"
          value={formData.aircraftId?.toString() || ''}
          onChange={(e) => setFormData({ ...formData, aircraftId: parseInt(e.target.value) })}
          error={errors.aircraftId}
          options={[
            { value: '', label: 'Select an aircraft' },
            ...aircraft.map(a => ({ value: a.id.toString(), label: `${a.tailNumber} - ${a.model}` })),
          ]}
        />

        <Input
          label="Scheduled Date & Time"
          type="datetime-local"
          value={formData.scheduledDate}
          onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
          error={errors.scheduledDate}
        />

        <Select
          label="Departure Location"
          value={departureAirport}
          onChange={(e) => setDepartureAirport(e.target.value)}
          error={errors.departureLocation}
          options={[
            { value: '', label: 'Select departure location' },
            ...COMMON_AIRPORTS.map(a => ({ value: a.name, label: a.name })),
          ]}
        />

        <Select
          label="Destination Location (Optional)"
          value={destinationAirport}
          onChange={(e) => setDestinationAirport(e.target.value)}
          options={[
            { value: '', label: 'No destination (local flight)' },
            ...COMMON_AIRPORTS.map(a => ({ value: a.name, label: a.name })),
          ]}
        />

        <Select
          label="Flight Type"
          value={formData.flightType}
          onChange={(e) => setFormData({ ...formData, flightType: e.target.value as any })}
          options={[
            { value: 'TRAINING', label: 'Training' },
            { value: 'SOLO', label: 'Solo' },
            { value: 'CROSS_COUNTRY', label: 'Cross Country' },
          ]}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            className="input min-h-[100px]"
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Additional notes about this flight..."
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" variant="primary" isLoading={loading} className="flex-1">
            Create Flight
          </Button>
          {onCancel && (
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}

