import { useState, FormEvent } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { createInstructor, CreateInstructorPayload } from '../../services/instructors.service';
import toast from 'react-hot-toast';

interface CreateInstructorFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateInstructorForm({ onSuccess, onCancel }: CreateInstructorFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateInstructorPayload>({
    email: '',
    password: '',
    name: '',
    phone: '',
    certifications: '',
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
      // Convert certifications string to array if provided
      const payload: CreateInstructorPayload = {
        ...formData,
        certifications: formData.certifications
          ? formData.certifications.split(',').map((c) => c.trim()).filter(Boolean)
          : undefined,
      };

      await createInstructor(payload);
      toast.success('Instructor created successfully!');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create instructor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Create New Instructor">
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Certifications (Optional)
          </label>
          <Input
            type="text"
            value={formData.certifications || ''}
            onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
            placeholder="Comma-separated (e.g., CFI, CFII, MEI)"
            error={errors.certifications}
          />
          <p className="mt-1 text-xs text-gray-500">
            Enter certifications separated by commas
          </p>
        </div>

        <div className="flex items-center gap-3 pt-4">
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Instructor'}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}

