import { useState, useEffect, useCallback } from 'react';
import { networkSecurity } from '@/services/networkSecurity';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface NetworkSecurityConfig {
  enableContinuousMonitoring?: boolean;
  monitoringInterval?: number; // in milliseconds
  riskThresholds?: {
    requireAdditionalAuth: number;
    blockAccess: number;
  };
}

export function useNetworkSecurity(config: NetworkSecurityConfig = {}) {
  const {
    enableContinuousMonitoring = true,
    monitoringInterval = 30000, // 30 seconds
    riskThresholds = {
      requireAdditionalAuth: 70,
      blockAccess: 90,
    },
  } = config;

  const { user } = useAuth();
  const [networkAssessment, setNetworkAssessment] = useState<Awaited<ReturnType<typeof networkSecurity.performNetworkAssessment>> | null>(null);
  const [networkMetrics, setNetworkMetrics] = useState(networkSecurity.getNetworkMetrics());
  const [isAssessing, setIsAssessing] = useState(false);

  const performAssessment = useCallback(async () => {
    if (!user) return;

    try {
      setIsAssessing(true);
      const assessment = await networkSecurity.performNetworkAssessment();
      setNetworkAssessment(assessment);
      setNetworkMetrics(networkSecurity.getNetworkMetrics());

      // Handle risk levels
      if (assessment.riskScore >= riskThresholds.blockAccess) {
        toast.error('Network security risk too high. Access blocked.');
        // You might want to force logout here
      } else if (assessment.riskScore >= riskThresholds.requireAdditionalAuth) {
        toast.warning('Additional authentication required due to network security concerns.');
        // Trigger additional auth flow
      }

      // Handle connection quality
      if (networkMetrics.connectionQuality === 'poor') {
        toast.warning('Poor network connection detected. This may impact security features.');
      }

      return assessment;
    } catch (error) {
      console.error('Network security assessment failed:', error);
      toast.error('Failed to assess network security');
    } finally {
      setIsAssessing(false);
    }
  }, [user, riskThresholds, networkMetrics.connectionQuality]);

  useEffect(() => {
    if (!user || !enableContinuousMonitoring) return;

    // Perform initial assessment
    performAssessment();

    // Set up continuous monitoring
    const intervalId = setInterval(performAssessment, monitoringInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [user, enableContinuousMonitoring, monitoringInterval, performAssessment]);

  const getConnectionStatus = useCallback(() => {
    if (!networkMetrics) return 'unknown';

    const { connectionQuality, latency, packetLoss } = networkMetrics;
    
    if (connectionQuality === 'poor') {
      return 'critical';
    }

    if (latency > 500 || packetLoss > 15) {
      return 'warning';
    }

    if (latency > 200 || packetLoss > 5) {
      return 'degraded';
    }

    return 'healthy';
  }, [networkMetrics]);

  const getSecurityStatus = useCallback(() => {
    if (!networkAssessment) return 'unknown';

    const { riskScore } = networkAssessment;

    if (riskScore >= riskThresholds.blockAccess) {
      return 'critical';
    }

    if (riskScore >= riskThresholds.requireAdditionalAuth) {
      return 'warning';
    }

    if (riskScore >= 50) {
      return 'moderate';
    }

    return 'secure';
  }, [networkAssessment, riskThresholds]);

  return {
    networkAssessment,
    networkMetrics,
    isAssessing,
    performAssessment,
    getConnectionStatus,
    getSecurityStatus,
  };
} 