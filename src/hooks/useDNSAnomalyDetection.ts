import { useState, useEffect, useCallback } from 'react';
import { dnsAnomalyDetection } from '@/services/dns/dnsAnomalyDetection';
import type { DNSAnomaly, DNSPattern, AnomalyDetectionConfig } from '@/types/dns';
import { toast } from 'sonner';

export function useDNSAnomalyDetection(domain: string, config: AnomalyDetectionConfig = {}) {
  const {
    enableContinuousMonitoring = true,
    monitoringInterval = 300000, // 5 minutes
    severityThresholds = {
      notifyOnCritical: true,
      notifyOnHigh: true,
      notifyOnMedium: false,
    },
  } = config;

  const [anomalies, setAnomalies] = useState<DNSAnomaly[]>([]);
  const [pattern, setPattern] = useState<DNSPattern | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const updateAnomalies = useCallback(async () => {
    const currentAnomalies = dnsAnomalyDetection.getAnomalies(domain);
    setAnomalies(currentAnomalies);

    // Handle notifications based on severity thresholds
    const newAnomalies = currentAnomalies.filter(
      anomaly => !anomalies.some(a => 
        a.timestamp === anomaly.timestamp && 
        a.type === anomaly.type
      )
    );

    if (newAnomalies.length > 0) {
      if (severityThresholds.notifyOnCritical) {
        const criticalAnomalies = newAnomalies.filter(a => a.severity === 'critical');
        if (criticalAnomalies.length > 0) {
          toast.error(`Critical DNS anomalies detected for ${domain}`, {
            description: criticalAnomalies.map(a => a.description).join(', '),
          });
        }
      }

      if (severityThresholds.notifyOnHigh) {
        const highAnomalies = newAnomalies.filter(a => a.severity === 'high');
        if (highAnomalies.length > 0) {
          toast.warning(`High-risk DNS anomalies detected for ${domain}`, {
            description: highAnomalies.map(a => a.description).join(', '),
          });
        }
      }

      if (severityThresholds.notifyOnMedium) {
        const mediumAnomalies = newAnomalies.filter(a => a.severity === 'medium');
        if (mediumAnomalies.length > 0) {
          toast.info(`Medium-risk DNS anomalies detected for ${domain}`, {
            description: mediumAnomalies.map(a => a.description).join(', '),
          });
        }
      }
    }
  }, [domain, anomalies, severityThresholds]);

  const updatePattern = useCallback(() => {
    const currentPattern = dnsAnomalyDetection.getPattern(domain);
    setPattern(currentPattern);
  }, [domain]);

  useEffect(() => {
    if (!enableContinuousMonitoring) return;

    setIsMonitoring(true);

    // Initial update
    updateAnomalies();
    updatePattern();

    // Set up continuous monitoring
    const intervalId = setInterval(() => {
      updateAnomalies();
      updatePattern();
    }, monitoringInterval);

    return () => {
      clearInterval(intervalId);
      setIsMonitoring(false);
    };
  }, [
    domain,
    enableContinuousMonitoring,
    monitoringInterval,
    updateAnomalies,
    updatePattern,
  ]);

  const getAnomaliesByType = useCallback((type: DNSAnomaly['type']) => {
    return anomalies.filter(a => a.type === type);
  }, [anomalies]);

  const getAnomaliesBySeverity = useCallback((severity: DNSAnomaly['severity']) => {
    return anomalies.filter(a => a.severity === severity);
  }, [anomalies]);

  const getAnomalyStats = useCallback(() => {
    const stats = {
      total: anomalies.length,
      bySeverity: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
      },
      byType: {
        pattern: 0,
        timing: 0,
        volume: 0,
        resolution: 0,
        security: 0,
      },
      lastDetected: anomalies.length > 0 
        ? Math.max(...anomalies.map(a => a.timestamp))
        : null,
    };

    anomalies.forEach(anomaly => {
      stats.bySeverity[anomaly.severity]++;
      stats.byType[anomaly.type]++;
    });

    return stats;
  }, [anomalies]);

  const clearAnomalies = useCallback(() => {
    dnsAnomalyDetection.clearData(domain);
    setAnomalies([]);
    setPattern(null);
  }, [domain]);

  return {
    anomalies,
    pattern,
    isMonitoring,
    getAnomaliesByType,
    getAnomaliesBySeverity,
    getAnomalyStats,
    clearAnomalies,
  };
} 