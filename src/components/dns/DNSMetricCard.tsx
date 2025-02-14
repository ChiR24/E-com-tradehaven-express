import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/tooltip';

interface DNSMetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  status?: 'success' | 'warning' | 'error' | 'info';
  loading?: boolean;
  tooltip?: string;
  className?: string;
}

export function DNSMetricCard({
  title,
  value,
  icon,
  trend,
  status = 'info',
  loading = false,
  tooltip,
  className,
}: DNSMetricCardProps) {
  const theme = useTheme();

  const statusStyles = {
    success: 'bg-success-50 text-success-700',
    warning: 'bg-warning-50 text-warning-700',
    error: 'bg-error-50 text-error-700',
    info: 'bg-primary-50 text-primary-700',
  };

  const trendStyles = {
    positive: 'text-success-600',
    negative: 'text-error-600',
  };

  const card = (
    <div
      className={cn(
        'rounded-xl p-6 transition-all duration-200',
        statusStyles[status],
        {
          'animate-pulse': loading,
          'hover:shadow-md': !loading,
        },
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{title}</p>
        {icon && (
          <div className="rounded-full bg-white/20 p-2">
            {icon}
          </div>
        )}
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight">{value}</span>
        {trend && (
          <span
            className={cn(
              'inline-flex items-baseline text-sm font-medium',
              trend.isPositive ? trendStyles.positive : trendStyles.negative
            )}
          >
            {trend.isPositive ? '↑' : '↓'} {trend.value}%
            <span className="ml-1 text-xs text-gray-500">{trend.label}</span>
          </span>
        )}
      </div>
    </div>
  );

  if (tooltip) {
    return (
      <Tooltip content={tooltip}>
        {card}
      </Tooltip>
    );
  }

  return card;
} 