import { useState, FormEvent } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { createStudent, CreateStudentPayload } from '../../services/students.service';
import toast from 'react-hot-toast';

interface CreateStudentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateStudentForm({ onSuccess, onCancel }: CreateStudentFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateStudentPayload>({
    email: '',
    password: '',
    name: '',
    phone: '',
    trainingLevel: 'STUDENT_PILOT',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.name) {
      newErrors.name = 'Name is required';
    }

    if (!formData.trainingLevel) {
      newErrors.trainingLevel = 'Training level is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await createStudent(formData);
      toast.success('Student created successfully!');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Create New Student">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          required
        />

        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={errors.email}
          required
        />

        <Input
          label="Password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          error={errors.password}
          required
        />

        <Input
          label="Phone (Optional)"
          type="tel"
          value={formData.phone || ''}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          error={errors.phone}
        />

        <Select
          label="Training Level"
          value={formData.trainingLevel}
          onChange={(e) =>
            setFormData({
              ...formData,
              trainingLevel: e.target.value as 'STUDENT_PILOT' | 'PRIVATE_PILOT' | 'INSTRUMENT_RATED',
            })
          }
          error={errors.trainingLevel}
          required
          options={[
            { value: 'STUDENT_PILOT', label: 'Student Pilot' },
            { value: 'PRIVATE_PILOT', label: 'Private Pilot' },
            { value: 'INSTRUMENT_RATED', label: 'Instrument Rated' },
          ]}
        />

        <div className="flex items-center gap-3 pt-4">
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Student'}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}

