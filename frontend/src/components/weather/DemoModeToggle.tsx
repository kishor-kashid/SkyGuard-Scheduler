import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { setDemoMode } from '../../services/weather.service';
import toast from 'react-hot-toast';

interface DemoModeToggleProps {
  initialValue?: boolean;
  onToggle?: (enabled: boolean) => void;
}

export function DemoModeToggle({ initialValue = false, onToggle }: DemoModeToggleProps) {
  const [enabled, setEnabled] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  // Only admins can toggle demo mode
  const canToggle = user?.role === 'ADMIN';

  useEffect(() => {
    setEnabled(initialValue);
  }, [initialValue]);

  const handleToggle = async () => {
    if (!canToggle) {
      toast.error('Only administrators can toggle demo mode');
      return;
    }

    setLoading(true);
    try {
      const newValue = !enabled;
      await setDemoMode(newValue);
      setEnabled(newValue);
      onToggle?.(newValue);
      toast.success(`Demo mode ${newValue ? 'enabled' : 'disabled'}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to toggle demo mode');
    } finally {
      setLoading(false);
    }
  };

  if (!canToggle) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-gray-700">
        Demo Mode
      </label>
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
          ${enabled ? 'bg-primary-600' : 'bg-gray-300'}
          ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        role="switch"
        aria-checked={enabled}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${enabled ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
      <span className="text-sm text-gray-600">
        {enabled ? 'Enabled' : 'Disabled'}
      </span>
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
      )}
    </div>
  );
}

