import { RescheduleOption } from '../../types';
import { Calendar, Cloud, TrendingUp, CheckCircle } from 'lucide-react';
import { Button } from '../common/Button';

interface RescheduleOptionCardProps {
  option: RescheduleOption;
  isSelected: boolean;
  onSelect: () => void;
}

export function RescheduleOptionCard({
  option,
  isSelected,
  onSelect,
}: RescheduleOptionCardProps) {
  const dateTime = new Date(option.dateTime);
  const priorityLabels = {
    1: { label: 'Best Option', color: 'bg-green-100 text-green-800' },
    2: { label: 'Good Alternative', color: 'bg-blue-100 text-blue-800' },
    3: { label: 'Acceptable', color: 'bg-yellow-100 text-yellow-800' },
  };

  const priorityInfo = priorityLabels[option.priority as keyof typeof priorityLabels] || priorityLabels[3];
  const confidencePercent = Math.round(option.confidence * 100);

  return (
    <div
      className={`border-2 rounded-lg p-4 transition-all cursor-pointer ${
        isSelected
          ? 'border-primary-500 bg-primary-50'
          : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="font-semibold text-gray-900">
                {dateTime.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
              <p className="text-sm text-gray-600">
                {dateTime.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isSelected && (
            <CheckCircle className="w-5 h-5 text-primary-600" />
          )}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityInfo.color}`}>
            {priorityInfo.label}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {/* Confidence Score */}
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-gray-400" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600">Confidence</span>
              <span className="text-xs font-medium text-gray-900">{confidencePercent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all"
                style={{ width: `${confidencePercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Reasoning */}
        <div>
          <p className="text-xs font-medium text-gray-700 mb-1">Why this option:</p>
          <p className="text-sm text-gray-600">{option.reasoning}</p>
        </div>

        {/* Weather Forecast */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
          <Cloud className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-blue-900 mb-1">Weather Forecast</p>
            <p className="text-xs text-blue-800">{option.weatherForecast}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

