import { ReactNode } from 'react';
import { Card } from '../common/Card';

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  subtitle?: string;
  className?: string;
}

export function MetricsCard({ title, value, icon, trend, subtitle, className = '' }: MetricsCardProps) {
  return (
    <Card className={className}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-sm font-medium ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              {trend.label && (
                <span className="text-xs text-gray-500">{trend.label}</span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-primary-100 rounded-lg">
            <div className="text-primary-600">
              {icon}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

