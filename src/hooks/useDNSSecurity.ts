import { useState, useEffect, useCallback } from 'react';
import { dnsSecurityService } from '@/services/dnsSecurityService';
import { toast } from 'sonner';

interface DNSSecurityConfig {
  enableContinuousMonitoring?: boolean;
  monitoringInterval?: number; // in milliseconds
  performanceThresholds?: {
    responseTime: number; // in milliseconds
    querySuccessRate: number; // percentage
  };
}

export function useDNSSecurity(config: DNSSecurityConfig = {}) {
  const {
    enableContinuousMonitoring = true,
    monitoringInterval = 300000, // 5 minutes
    performanceThresholds = {
      responseTime: 500, // 500ms
      querySuccessRate: 90, // 90%
    },
  } = config;

  const [dnsAssessment, setDNSAssessment] = useState<Awaited<ReturnType<typeof dnsSecurityService.performDNSSecurityAssessment>> | null>(null);
  const [dnsMetrics, setDNSMetrics] = useState(dnsSecurityService.getDNSMetrics());
  const [isAssessing, setIsAssessing] = useState(false);

  const performAssessment = useCallback(async () => {
    try {
      setIsAssessing(true);
      const assessment = await dnsSecurityService.performDNSSecurityAssessment();
      setDNSAssessment(assessment);
      setDNSMetrics(dnsSecurityService.getDNSMetrics());

      // Handle performance issues
      if (assessment.metrics.responseTime > performanceThresholds.responseTime) {
        toast.warning('DNS resolution is slower than usual');
      }

      if (assessment.metrics.querySuccessRate < performanceThresholds.querySuccessRate) {
        toast.warning('DNS resolution reliability is degraded');
      }

      // Handle security issues
      if (!assessment.securityInfo.hasDNSSEC) {
        toast.error('DNSSEC is not enabled - vulnerable to DNS spoofing');
      }

      if (assessment.securityInfo.vulnerabilities.length > 0) {
        const criticalVulns = assessment.securityInfo.vulnerabilities.filter(
          v => v.severity === 'critical'
        );
        if (criticalVulns.length > 0) {
          toast.error(`${criticalVulns.length} critical DNS vulnerabilities detected`);
        }
      }

      return assessment;
    } catch (error) {
      console.error('DNS security assessment failed:', error);
      toast.error('Failed to assess DNS security');
    } finally {
      setIsAssessing(false);
    }
  }, [performanceThresholds]);

  useEffect(() => {
    if (!enableContinuousMonitoring) return;

    // Perform initial assessment
    performAssessment();

    // Set up continuous monitoring
    const intervalId = setInterval(performAssessment, monitoringInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [enableContinuousMonitoring, monitoringInterval, performAssessment]);

  const getDNSSecurityStatus = useCallback(() => {
    if (!dnsAssessment) return 'unknown';

    const { securityInfo, metrics } = dnsAssessment;

    // Check for critical security issues
    if (
      securityInfo.vulnerabilities.some(v => v.severity === 'critical') ||
      metrics.resolverHealth === 'poor'
    ) {
      return 'critical';
    }

    // Check for high-risk issues
    if (
      !securityInfo.hasDNSSEC ||
      securityInfo.vulnerabilities.some(v => v.severity === 'high') ||
      metrics.querySuccessRate < 70
    ) {
      return 'high-risk';
    }

    // Check for moderate issues
    if (
      !securityInfo.hasCAA ||
      !securityInfo.hasSPF ||
      !securityInfo.hasDMARC ||
      metrics.resolverHealth === 'degraded'
    ) {
      return 'moderate-risk';
    }

    // Check for low-risk issues
    if (
      !securityInfo.hasNameserverRedundancy ||
      metrics.querySuccessRate < 90
    ) {
      return 'low-risk';
    }

    return 'secure';
  }, [dnsAssessment]);

  const getDNSHealthStatus = useCallback(() => {
    if (!dnsMetrics) return 'unknown';

    const { responseTime, querySuccessRate, resolverHealth } = dnsMetrics;

    if (resolverHealth === 'poor' || querySuccessRate < 50) {
      return 'critical';
    }

    if (
      resolverHealth === 'degraded' ||
      querySuccessRate < performanceThresholds.querySuccessRate ||
      responseTime > performanceThresholds.responseTime
    ) {
      return 'degraded';
    }

    return 'healthy';
  }, [dnsMetrics, performanceThresholds]);

  const getSecurityScore = useCallback((): number => {
    if (!dnsAssessment) return 0;

    const { securityInfo, metrics } = dnsAssessment;
    let score = 100;

    // Deduct points for missing security features
    if (!securityInfo.hasDNSSEC) score -= 30;
    if (!securityInfo.hasCAA) score -= 10;
    if (!securityInfo.hasSPF) score -= 15;
    if (!securityInfo.hasDMARC) score -= 15;
    if (!securityInfo.hasNameserverRedundancy) score -= 10;

    // Deduct points for vulnerabilities
    securityInfo.vulnerabilities.forEach(vuln => {
      switch (vuln.severity) {
        case 'critical':
          score -= 25;
          break;
        case 'high':
          score -= 15;
          break;
        case 'medium':
          score -= 10;
          break;
        case 'low':
          score -= 5;
          break;
      }
    });

    // Deduct points for poor performance
    if (metrics.resolverHealth === 'poor') score -= 20;
    if (metrics.resolverHealth === 'degraded') score -= 10;
    if (metrics.querySuccessRate < 70) score -= 15;
    if (metrics.querySuccessRate < 90) score -= 5;

    return Math.max(0, score);
  }, [dnsAssessment]);

  return {
    dnsAssessment,
    dnsMetrics,
    isAssessing,
    performAssessment,
    getDNSSecurityStatus,
    getDNSHealthStatus,
    getSecurityScore,
  };
} 