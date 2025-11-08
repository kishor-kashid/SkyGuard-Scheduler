import { WeatherBriefing } from '../../types';
import { Card } from '../common/Card';
import { AlertCircle, CheckCircle, AlertTriangle, XCircle, TrendingUp, Cloud, Wind, Eye, Thermometer, Droplets, Zap, Snowflake } from 'lucide-react';

interface WeatherBriefingCardProps {
  briefing: WeatherBriefing;
  compact?: boolean;
  onViewFull?: () => void;
}

export function WeatherBriefingCard({ briefing, compact = false, onViewFull }: WeatherBriefingCardProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'LOW':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'MODERATE':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'HIGH':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'SEVERE':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'LOW':
        return <CheckCircle className="w-5 h-5" />;
      case 'MODERATE':
        return <AlertCircle className="w-5 h-5" />;
      case 'HIGH':
        return <AlertTriangle className="w-5 h-5" />;
      case 'SEVERE':
        return <XCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getRecommendationColor = (action: string) => {
    switch (action) {
      case 'PROCEED':
        return 'text-green-600 bg-green-50';
      case 'CAUTION':
        return 'text-yellow-600 bg-yellow-50';
      case 'DELAY':
        return 'text-orange-600 bg-orange-50';
      case 'CANCEL':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (compact) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <div className="space-y-3">
          {/* Summary */}
          <p className="text-sm text-gray-700">{briefing.summary}</p>

          {/* Risk Assessment */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getRiskColor(briefing.riskAssessment.level)}`}>
            {getRiskIcon(briefing.riskAssessment.level)}
            <span className="font-semibold text-sm">{briefing.riskAssessment.level} Risk</span>
          </div>

          {/* Recommendation */}
          <div className={`px-3 py-2 rounded-lg ${getRecommendationColor(briefing.recommendation.action)}`}>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm">{briefing.recommendation.action}</span>
              {onViewFull && (
                <button
                  onClick={onViewFull}
                  className="text-xs underline hover:no-underline"
                >
                  View Full Briefing
                </button>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-6">
        {/* Summary */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Summary</h3>
          <p className="text-gray-700">{briefing.summary}</p>
        </div>

        {/* Current Conditions */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Current Conditions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Visibility</p>
                <p className="font-semibold">{briefing.currentConditions.visibility} mi</p>
              </div>
            </div>
            {briefing.currentConditions.ceiling && (
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Ceiling</p>
                  <p className="font-semibold">{briefing.currentConditions.ceiling} ft</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Wind</p>
                <p className="font-semibold">{briefing.currentConditions.windSpeed} kt</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Temp</p>
                <p className="font-semibold">{briefing.currentConditions.temperature}°F</p>
              </div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {briefing.currentConditions.precipitation && (
              <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                <Droplets className="w-3 h-3" />
                Precipitation
              </span>
            )}
            {briefing.currentConditions.thunderstorms && (
              <span className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                <Zap className="w-3 h-3" />
                Thunderstorms
              </span>
            )}
            {briefing.currentConditions.icing && (
              <span className="flex items-center gap-1 px-2 py-1 bg-cyan-100 text-cyan-700 rounded text-xs">
                <Snowflake className="w-3 h-3" />
                Icing
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-gray-600">{briefing.currentConditions.description}</p>
        </div>

        {/* Forecast */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Forecast</h3>
          <p className="text-gray-700 mb-2">{briefing.forecast.description}</p>
          <p className="text-sm text-gray-600 mb-2">Time Range: {briefing.forecast.timeRange}</p>
          {briefing.forecast.expectedChanges.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Expected Changes:</p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {briefing.forecast.expectedChanges.map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Risk Assessment */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Risk Assessment</h3>
          <div className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${getRiskColor(briefing.riskAssessment.level)}`}>
            {getRiskIcon(briefing.riskAssessment.level)}
            <div className="flex-1">
              <p className="font-semibold">{briefing.riskAssessment.level} Risk</p>
              <p className="text-sm mt-1">{briefing.riskAssessment.summary}</p>
            </div>
          </div>
          {briefing.riskAssessment.factors.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Risk Factors:</p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {briefing.riskAssessment.factors.map((factor, index) => (
                  <li key={index}>{factor}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Recommendation */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Recommendation</h3>
          <div className={`px-4 py-3 rounded-lg ${getRecommendationColor(briefing.recommendation.action)}`}>
            <p className="font-semibold mb-2">{briefing.recommendation.action}</p>
            <p className="text-sm">{briefing.recommendation.reasoning}</p>
            {briefing.recommendation.alternatives && briefing.recommendation.alternatives.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium mb-1">Alternatives:</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {briefing.recommendation.alternatives.map((alt, index) => (
                    <li key={index}>{alt}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Historical Comparison */}
        {briefing.historicalComparison && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Historical Comparison
            </h3>
            {briefing.historicalComparison.trends && (
              <p className="text-sm text-gray-700 mb-3">{briefing.historicalComparison.trends}</p>
            )}
            {briefing.historicalComparison.similarConditions && briefing.historicalComparison.similarConditions.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Similar Conditions:</p>
                {briefing.historicalComparison.similarConditions.map((similar, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg text-sm">
                    <p className="font-medium text-gray-900">{similar.date}</p>
                    <p className="text-gray-600">{similar.conditions}</p>
                    <p className="text-gray-500 mt-1">{similar.outcome}</p>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Confidence: {Math.round(briefing.historicalComparison.confidence * 100)}%
            </p>
          </div>
        )}

        {/* Confidence Score */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Briefing Confidence:</span>
            <span className="font-semibold text-gray-900">
              {Math.round(briefing.confidence * 100)}%
            </span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${briefing.confidence * 100}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

