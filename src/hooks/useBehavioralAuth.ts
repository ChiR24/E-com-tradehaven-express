import { useState, useEffect, useCallback } from 'react';
import { behavioralBiometrics } from '@/services/behavioralBiometrics';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface BehavioralAuthConfig {
  minConfidenceScore?: number;
  enableContinuousAuth?: boolean;
  authInterval?: number; // in milliseconds
  strictMode?: boolean;
}

export function useBehavioralAuth(config: BehavioralAuthConfig = {}) {
  const {
    minConfidenceScore = 0.7,
    enableContinuousAuth = true,
    authInterval = 60000, // 1 minute
    strictMode = false,
  } = config;

  const { user } = useAuth();
  const [isVerified, setIsVerified] = useState(false);
  const [confidenceScore, setConfidenceScore] = useState(0);
  const [isCollectingData, setIsCollectingData] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsVerified(false);
      setConfidenceScore(0);
      behavioralBiometrics.reset();
      return;
    }

    // Start collecting behavioral data
    setIsCollectingData(true);

    // Set up continuous authentication if enabled
    let intervalId: number;
    if (enableContinuousAuth) {
      intervalId = window.setInterval(() => {
        verifyBehavior();
      }, authInterval);
    }

    return () => {
      setIsCollectingData(false);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [user, enableContinuousAuth, authInterval]);

  const createProfile = useCallback(async () => {
    if (!user) return;

    try {
      const profile = behavioralBiometrics.createProfile(user.id);
      setConfidenceScore(profile.confidenceScore);
      
      if (profile.confidenceScore >= minConfidenceScore) {
        setIsVerified(true);
        toast.success('Behavioral profile created successfully');
      } else {
        toast.info('Please continue using the application to improve profile accuracy');
      }

      return profile;
    } catch (error) {
      console.error('Failed to create behavioral profile:', error);
      toast.error('Failed to create behavioral profile');
    }
  }, [user, minConfidenceScore]);

  const verifyBehavior = useCallback(() => {
    if (!user) return false;

    const score = behavioralBiometrics.verifyUser(user.id);
    setConfidenceScore(score);

    const verified = score >= minConfidenceScore;
    setIsVerified(verified);

    if (!verified && strictMode) {
      toast.error('Behavioral verification failed. Please re-authenticate.');
      // You might want to trigger a re-authentication flow here
    }

    return verified;
  }, [user, minConfidenceScore, strictMode]);

  const updateProfile = useCallback(() => {
    if (!user) return;

    try {
      behavioralBiometrics.updateProfile(user.id);
      verifyBehavior();
    } catch (error) {
      console.error('Failed to update behavioral profile:', error);
    }
  }, [user, verifyBehavior]);

  return {
    isVerified,
    confidenceScore,
    isCollectingData,
    createProfile,
    verifyBehavior,
    updateProfile,
  };
} 