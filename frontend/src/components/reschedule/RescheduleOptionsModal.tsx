import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { RescheduleOptionCard } from './RescheduleOptionCard';
import { RescheduleOptionsResponse, RescheduleOption } from '../../types';
import { getRescheduleOptions, confirmReschedule } from '../../services/flights.service';
import { useFlightsStore } from '../../store/flightsStore';
import { Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface RescheduleOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  flightId: number;
  onRescheduleComplete?: () => void;
}

export function RescheduleOptionsModal({
  isOpen,
  onClose,
  flightId,
  onRescheduleComplete,
}: RescheduleOptionsModalProps) {
  const [optionsData, setOptionsData] = useState<RescheduleOptionsResponse | null>(null);
  const [selectedOption, setSelectedOption] = useState<RescheduleOption | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { fetchFlights } = useFlightsStore();

  useEffect(() => {
    if (isOpen && flightId) {
      loadRescheduleOptions();
    } else {
      // Reset state when modal closes
      setOptionsData(null);
      setSelectedOption(null);
      setError(null);
    }
  }, [isOpen, flightId]);

  const loadRescheduleOptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRescheduleOptions(flightId);
      setOptionsData(data);
      if (data.options.length > 0) {
        // Auto-select the first (best) option
        setSelectedOption(data.options[0]);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load reschedule options';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedOption) {
      toast.error('Please select a reschedule option');
      return;
    }

    setConfirming(true);
    try {
      await confirmReschedule(flightId, selectedOption);
      toast.success('Flight rescheduled successfully!');
      await fetchFlights(); // Refresh flights list
      onRescheduleComplete?.();
      onClose();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to confirm reschedule';
      toast.error(errorMessage);
    } finally {
      setConfirming(false);
    }
  };

  const originalDate = optionsData?.originalDate
    ? new Date(optionsData.originalDate).toLocaleString()
    : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reschedule Flight"
      size="lg"
    >
      <div className="space-y-6">
        {/* Original Flight Info */}
        {originalDate && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Original Scheduled Date</p>
            <p className="font-semibold text-gray-900">{originalDate}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600 mb-4" />
            <p className="text-gray-600">Generating reschedule options...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="font-semibold text-red-900">Error</p>
            </div>
            <p className="text-sm text-red-800">{error}</p>
            <Button
              variant="secondary"
              onClick={loadRescheduleOptions}
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Options List */}
        {!loading && !error && optionsData && optionsData.options.length > 0 && (
          <>
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Select one of the following reschedule options. The AI has analyzed availability,
                weather patterns, and training requirements to suggest the best alternatives.
              </p>
            </div>

            <div className="space-y-4">
              {optionsData.options.map((option, index) => (
                <RescheduleOptionCard
                  key={index}
                  option={option}
                  isSelected={selectedOption?.dateTime === option.dateTime}
                  onSelect={() => setSelectedOption(option)}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button variant="secondary" onClick={onClose} disabled={confirming}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirm}
                isLoading={confirming}
                disabled={!selectedOption}
              >
                Confirm Reschedule
              </Button>
            </div>
          </>
        )}

        {/* No Options */}
        {!loading && !error && optionsData && optionsData.options.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No reschedule options available at this time.</p>
            <p className="text-sm text-gray-500 mt-2">
              Please try again later or contact support.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}

