import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { WeatherBriefingCard } from './WeatherBriefingCard';
import { WeatherBriefing } from '../../types';
import { generateFlightBriefing, getFlightBriefing } from '../../services/weatherBriefing.service';
import { Loader2, RefreshCw, Printer } from 'lucide-react';
import toast from 'react-hot-toast';

interface WeatherBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  flightId: number;
}

export function WeatherBriefingModal({ isOpen, onClose, flightId }: WeatherBriefingModalProps) {
  const [briefing, setBriefing] = useState<WeatherBriefing | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadBriefing = async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Try to get cached briefing first (unless forcing refresh)
      if (!forceRefresh) {
        try {
          const cached = await getFlightBriefing(flightId);
          setBriefing(cached);
          setLoading(false);
          return;
        } catch (error) {
          // If cached fails, generate new one
        }
      }

      // Generate new briefing
      const newBriefing = await generateFlightBriefing(flightId);
      setBriefing(newBriefing);
    } catch (error: any) {
      console.error('Error loading briefing:', error);
      toast.error(error.response?.data?.message || 'Failed to load weather briefing');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isOpen && flightId) {
      loadBriefing();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, flightId]);

  const handleRefresh = () => {
    loadBriefing(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Weather Briefing"
      size="xl"
    >
      <div className="space-y-4">
        {/* Actions */}
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>

        {/* Loading State */}
        {loading && !briefing && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Generating weather briefing...</span>
          </div>
        )}

        {/* Briefing Content */}
        {briefing && (
          <div className="print:block">
            <WeatherBriefingCard briefing={briefing} />
            <div className="mt-4 text-xs text-gray-500 print:hidden">
              Generated: {new Date(briefing.generatedAt).toLocaleString()}
              {briefing.expiresAt && (
                <> • Expires: {new Date(briefing.expiresAt).toLocaleString()}</>
              )}
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && !briefing && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Failed to load weather briefing</p>
            <button
              onClick={() => loadBriefing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}

