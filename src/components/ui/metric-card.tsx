import React from 'react';
import { cn } from '@/lib/utils';
import { transitions } from '@/styles/theme';

interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: {
    value: number;
    isUpward: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  icon?: React.ReactNode;
  isLoading?: boolean;
}

const variantStyles = {
  default: 'bg-gray-50 text-gray-600',
  success: 'bg-success-50 text-success-600',
  warning: 'bg-warning-50 text-warning-600',
  error: 'bg-error-50 text-error-600',
  info: 'bg-primary-50 text-primary-600',
};

export function MetricCard({
  label,
  value,
  trend,
  variant = 'default',
  icon,
  isLoading = false,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg p-4 transition-all duration-200 hover:shadow-md',
        variantStyles[variant],
        {
          'animate-pulse': isLoading,
        }
      )}
    >
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">{label}</div>
        {icon && <div className="text-lg">{icon}</div>}
      </div>
      <div className="mt-2 flex items-baseline">
        <div className="text-3xl font-semibold tracking-tight">{value}</div>
        {trend && (
          <span
            className={cn(
              'ml-2 text-sm',
              trend.isUpward ? 'text-success-600' : 'text-error-600'
            )}
          >
            {trend.isUpward ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
    </div>
  );
} 