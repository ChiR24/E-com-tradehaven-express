import { useState, useEffect, useCallback } from 'react';
import { riskAssessment } from '@/services/riskAssessment';
import { useAuth } from '@/hooks/useAuth';
import { useBehavioralAuth } from '@/hooks/useBehavioralAuth';
import { UAParser } from 'ua-parser-js';
import { toast } from 'sonner';

interface RiskAssessmentConfig {
  enableContinuousAssessment?: boolean;
  assessmentInterval?: number; // in milliseconds
  riskThresholds?: {
    requireAdditionalAuth: number;
    requireStepUpAuth: number;
    blockAccess: number;
  };
}

export function useRiskAssessment(config: RiskAssessmentConfig = {}) {
  const {
    enableContinuousAssessment = true,
    assessmentInterval = 60000, // 1 minute
    riskThresholds = {
      requireAdditionalAuth: 60, // Medium risk
      requireStepUpAuth: 80,    // High risk
      blockAccess: 90,          // Critical risk
    },
  } = config;

  const { user } = useAuth();
  const { confidenceScore, isCollectingData } = useBehavioralAuth();
  const [currentAssessment, setCurrentAssessment] = useState<Awaited<ReturnType<typeof riskAssessment.assessRisk>> | null>(null);
  const [isAssessing, setIsAssessing] = useState(false);

  const getUserContext = useCallback(async () => {
    const parser = new UAParser();
    const result = parser.getResult();

    let location;
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };
    } catch {
      // Location access denied or unavailable
    }

    return {
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      location,
      deviceInfo: {
        platform: navigator.platform,
        browser: result.browser.name || 'Unknown',
        os: result.os.name || 'Unknown',
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        deviceMemory: (navigator as any).deviceMemory,
        hardwareConcurrency: navigator.hardwareConcurrency,
        touchSupport: 'ontouchstart' in window,
      },
      behavioralMetrics: {
        typingConsistency: confidenceScore,
        interactionFrequency: isCollectingData ? 1 : 0,
      },
      historicalData: {
        failedAttempts: 0, // You should track this in your auth system
        successfulLogins: 1,
        commonLoginTimes: [new Date().getHours()],
        knownLocations: [], // You should store this in your backend
      },
    };
  }, [confidenceScore, isCollectingData]);

  const performAssessment = useCallback(async () => {
    if (!user) return;

    try {
      setIsAssessing(true);
      const context = await getUserContext();
      const assessment = await riskAssessment.assessRisk(user.id, context);
      setCurrentAssessment(assessment);

      // Handle risk levels
      if (assessment.score >= riskThresholds.blockAccess) {
        toast.error('Access blocked due to high security risk. Please contact support.');
        // You might want to force logout here
      } else if (assessment.score >= riskThresholds.requireStepUpAuth) {
        toast.warning('Additional authentication required due to high risk activity.');
        // Trigger step-up auth flow
      } else if (assessment.score >= riskThresholds.requireAdditionalAuth) {
        toast.info('Please verify your identity.');
        // Trigger additional auth flow
      }

      return assessment;
    } catch (error) {
      console.error('Risk assessment failed:', error);
      toast.error('Failed to assess security risk');
    } finally {
      setIsAssessing(false);
    }
  }, [user, getUserContext, riskThresholds]);

  useEffect(() => {
    if (!user || !enableContinuousAssessment) return;

    // Perform initial assessment
    performAssessment();

    // Set up continuous assessment
    const intervalId = setInterval(performAssessment, assessmentInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [user, enableContinuousAssessment, assessmentInterval, performAssessment]);

  const getRiskHistory = useCallback(() => {
    if (!user) return [];
    return riskAssessment.getAssessmentHistory(user.id);
  }, [user]);

  const getAggregateRisk = useCallback(() => {
    if (!user) return null;
    return riskAssessment.getAggregateRisk(user.id);
  }, [user]);

  return {
    currentAssessment,
    isAssessing,
    performAssessment,
    getRiskHistory,
    getAggregateRisk,
  };
} 