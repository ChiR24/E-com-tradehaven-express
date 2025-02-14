import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MetricCard } from '@/components/ui/metric-card';
import { Timeline } from '@/components/ui/timeline';
import { useDNSAnomalyDetection } from '@/hooks/useDNSAnomalyDetection';
import { DNSAnomaly } from '@/types/dns';
import { 
  AlertTriangle, 
  Activity, 
  Clock, 
  Shield, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DNSMonitoringDashboardProps {
  domain: string;
}

export function DNSMonitoringDashboard({ domain }: DNSMonitoringDashboardProps) {
  const {
    anomalies,
    pattern,
    isMonitoring,
    getAnomaliesByType,
    getAnomaliesBySeverity,
    getAnomalyStats,
    clearAnomalies,
  } = useDNSAnomalyDetection(domain);

  const [showAllAnomalies, setShowAllAnomalies] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const stats = getAnomalyStats();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Add your refresh logic here
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getSeverityVariant = (severity: DNSAnomaly['severity']): 'error' | 'warning' | 'info' => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
      case 'low':
        return 'info';
    }
  };

  const timelineItems = anomalies.map(anomaly => ({
    title: anomaly.type,
    description: anomaly.description,
    timestamp: anomaly.timestamp,
    status: getSeverityVariant(anomaly.severity),
    icon: <AlertTriangle className="h-4 w-4" />,
  }));

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">DNS Security Monitor</h1>
        <div className="flex items-center gap-4">
          <Badge
            variant={isMonitoring ? 'success' : 'warning'}
            className="px-3 py-1"
          >
            {isMonitoring ? 'Monitoring Active' : 'Monitoring Paused'}
          </Badge>
          <button
            onClick={handleRefresh}
            className={cn(
              'rounded-full p-2 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500',
              {
                'animate-spin': isRefreshing,
              }
            )}
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Anomalies"
          value={stats.total}
          icon={<Activity className="h-5 w-5" />}
          variant="default"
        />
        <MetricCard
          label="Critical Issues"
          value={stats.bySeverity.critical}
          icon={<AlertTriangle className="h-5 w-5" />}
          variant="error"
          trend={
            stats.bySeverity.critical > 0
              ? {
                  value: 100,
                  isUpward: true,
                }
              : undefined
          }
        />
        <MetricCard
          label="Response Time"
          value={`${pattern?.averageResponseTime.toFixed(0) || 0}ms`}
          icon={<Clock className="h-5 w-5" />}
          variant="info"
        />
        <MetricCard
          label="Security Score"
          value={pattern?.securityScore || 100}
          icon={<Shield className="h-5 w-5" />}
          variant={
            pattern?.securityScore >= 80
              ? 'success'
              : pattern?.securityScore >= 60
              ? 'warning'
              : 'error'
          }
        />
      </div>

      {/* Anomaly Timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Anomaly History</CardTitle>
            <button
              onClick={() => setShowAllAnomalies(!showAllAnomalies)}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              {showAllAnomalies ? (
                <>
                  Show Less
                  <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  Show All
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <Timeline
            items={timelineItems.slice(0, showAllAnomalies ? undefined : 5)}
          />
        </CardContent>
      </Card>

      {/* Pattern Analysis */}
      {pattern && (
        <Card>
          <CardHeader>
            <CardTitle>DNS Pattern Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-500">Query Distribution</div>
                <div className="h-32 rounded-lg bg-gray-50">
                  {/* Add chart component here */}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-500">Response Times</div>
                <div className="h-32 rounded-lg bg-gray-50">
                  {/* Add chart component here */}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-500">Success Rate</div>
                <div className="h-32 rounded-lg bg-gray-50">
                  {/* Add chart component here */}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => clearAnomalies()}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Clear History
        </button>
        <button
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Configure Alerts
        </button>
      </div>
    </div>
  );
} 