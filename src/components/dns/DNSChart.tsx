import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

interface DNSChartProps {
  type: 'queryDistribution' | 'responseTime' | 'successRate';
  data: any[];
  height?: number;
  className?: string;
  title?: string;
  subtitle?: string;
  loading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  const theme = useTheme();
  if (!active || !payload) return null;

  return (
    <div className={theme.chart.tooltip}>
      <div className="font-medium">{label}</div>
      {payload.map((item: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span>{item.value}</span>
        </div>
      ))}
    </div>
  );
};

export function DNSChart({
  type,
  data,
  height = 200,
  className,
  title,
  subtitle,
  loading = false,
}: DNSChartProps) {
  const theme = useTheme();

  const renderChart = () => {
    switch (type) {
      case 'queryDistribution':
        return (
          <AreaChart data={data}>
            <defs>
              <linearGradient id="queryGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={theme.chart.gradients.primary.start}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={theme.chart.gradients.primary.end}
                  stopOpacity={0.2}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="hour"
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
            />
            <YAxis stroke="#6B7280" fontSize={12} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="count"
              stroke={theme.chart.gradients.primary.start}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#queryGradient)"
            />
          </AreaChart>
        );

      case 'responseTime':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="range"
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
            />
            <YAxis stroke="#6B7280" fontSize={12} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="count"
              stroke={theme.chart.gradients.warning.start}
              strokeWidth={2}
              dot={{
                fill: theme.chart.gradients.warning.start,
                strokeWidth: 2,
              }}
              activeDot={{
                r: 6,
                stroke: theme.chart.gradients.warning.start,
                strokeWidth: 2,
              }}
            />
          </LineChart>
        );

      case 'successRate':
        return (
          <AreaChart data={data}>
            <defs>
              <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={theme.chart.gradients.success.start}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={theme.chart.gradients.success.end}
                  stopOpacity={0.2}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="time"
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
            />
            <YAxis stroke="#6B7280" fontSize={12} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="rate"
              stroke={theme.chart.gradients.success.start}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#successGradient)"
            />
          </AreaChart>
        );
    }
  };

  return (
    <div
      className={cn(
        'rounded-xl bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md',
        {
          'animate-pulse': loading,
        },
        className
      )}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
      )}
      <div className="w-full" style={{ height }}>
        <ResponsiveContainer>
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-32 w-32 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
            </div>
          ) : (
            renderChart()
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
} 