import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { DNSAnomaly } from '@/types/dns';
import { useTheme } from '@/hooks/useTheme';
import { Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DNSFilterProps {
  selectedTypes: Set<DNSAnomaly['type']>;
  selectedSeverities: Set<DNSAnomaly['severity']>;
  onTypeChange: (type: DNSAnomaly['type']) => void;
  onSeverityChange: (severity: DNSAnomaly['severity']) => void;
  onSearch: (query: string) => void;
  className?: string;
}

const anomalyTypes: DNSAnomaly['type'][] = [
  'pattern',
  'timing',
  'volume',
  'resolution',
  'security',
];

const severityLevels: DNSAnomaly['severity'][] = [
  'critical',
  'high',
  'medium',
  'low',
];

export function DNSFilter({
  selectedTypes,
  selectedSeverities,
  onTypeChange,
  onSeverityChange,
  onSearch,
  className,
}: DNSFilterProps) {
  const theme = useTheme();
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search anomalies..."
            className={cn(
              theme.input.base,
              'w-full pl-10 pr-4 py-2 text-sm',
              theme.animation.hover
            )}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg',
            theme.button.secondary,
            theme.animation.hover
          )}
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {(selectedTypes.size > 0 || selectedSeverities.size > 0) && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-100 text-xs font-medium text-primary-700">
              {selectedTypes.size + selectedSeverities.size}
            </span>
          )}
        </button>
      </div>

      {showFilters && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-700">Type</h3>
              <div className="flex flex-wrap gap-2">
                {anomalyTypes.map((type) => (
                  <Badge
                    key={type}
                    variant={selectedTypes.has(type) ? 'default' : 'outline'}
                    className={cn(
                      'cursor-pointer select-none',
                      theme.animation.hover
                    )}
                    onClick={() => onTypeChange(type)}
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-700">Severity</h3>
              <div className="flex flex-wrap gap-2">
                {severityLevels.map((severity) => (
                  <Badge
                    key={severity}
                    variant={
                      selectedSeverities.has(severity)
                        ? severity === 'critical'
                          ? 'error'
                          : severity === 'high'
                          ? 'warning'
                          : 'info'
                        : 'outline'
                    }
                    className={cn(
                      'cursor-pointer select-none',
                      theme.animation.hover
                    )}
                    onClick={() => onSeverityChange(severity)}
                  >
                    {severity}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 