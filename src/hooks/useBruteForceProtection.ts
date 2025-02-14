import { useState, useCallback } from 'react';

interface BruteForceState {
  attempts: number;
  lastAttemptTime: number;
  blockUntil: number | null;
  complexity: 'normal' | 'enhanced' | 'maximum';
}

interface ProtectionConfig {
  maxAttempts?: number;
  blockDuration?: number; // in minutes
  attemptWindow?: number; // in minutes
  progressiveBlocking?: boolean;
  complexityThresholds?: {
    enhanced: number; // number of attempts before enhanced protection
    maximum: number; // number of attempts before maximum protection
  };
}

export function useBruteForceProtection(config: ProtectionConfig = {}) {
  const {
    maxAttempts = 5,
    blockDuration = 15,
    attemptWindow = 60,
    progressiveBlocking = true,
    complexityThresholds = {
      enhanced: 3,
      maximum: 5,
    },
  } = config;

  const [state, setState] = useState<BruteForceState>({
    attempts: 0,
    lastAttemptTime: 0,
    blockUntil: null,
    complexity: 'normal',
  });

  const getStoredState = useCallback((identifier: string): BruteForceState | null => {
    const stored = localStorage.getItem(`bruteforce_${identifier}`);
    return stored ? JSON.parse(stored) : null;
  }, []);

  const saveState = useCallback((identifier: string, state: BruteForceState) => {
    localStorage.setItem(`bruteforce_${identifier}`, JSON.stringify(state));
  }, []);

  const calculateBlockDuration = useCallback((attempts: number): number => {
    if (!progressiveBlocking) return blockDuration;

    // Progressive blocking: 15min -> 30min -> 1h -> 2h -> 4h -> 8h -> 24h
    const baseMinutes = blockDuration;
    const factor = Math.min(Math.floor(attempts / maxAttempts), 6);
    return baseMinutes * Math.pow(2, factor);
  }, [blockDuration, maxAttempts, progressiveBlocking]);

  const recordAttempt = useCallback(async (identifier: string) => {
    const now = Date.now();
    const storedState = getStoredState(identifier) || state;
    
    // Check if currently blocked
    if (storedState.blockUntil && now < storedState.blockUntil) {
      const remainingMinutes = Math.ceil((storedState.blockUntil - now) / 60000);
      throw new Error(`Account is temporarily locked. Please try again in ${remainingMinutes} minutes.`);
    }

    // Check if we should reset attempts (outside attempt window)
    const attemptWindowMs = attemptWindow * 60000;
    const shouldResetAttempts = (now - storedState.lastAttemptTime) > attemptWindowMs;

    const newState: BruteForceState = {
      attempts: shouldResetAttempts ? 1 : storedState.attempts + 1,
      lastAttemptTime: now,
      blockUntil: null,
      complexity: 'normal',
    };

    // Update complexity based on attempts
    if (newState.attempts >= complexityThresholds.maximum) {
      newState.complexity = 'maximum';
    } else if (newState.attempts >= complexityThresholds.enhanced) {
      newState.complexity = 'enhanced';
    }

    // Check if we should block
    if (newState.attempts >= maxAttempts) {
      const blockDurationMs = calculateBlockDuration(newState.attempts) * 60000;
      newState.blockUntil = now + blockDurationMs;
      throw new Error(`Too many failed attempts. Account is locked for ${blockDurationMs / 60000} minutes.`);
    }

    setState(newState);
    saveState(identifier, newState);

    return newState;
  }, [state, maxAttempts, attemptWindow, calculateBlockDuration, complexityThresholds, getStoredState, saveState]);

  const resetAttempts = useCallback((identifier: string) => {
    const newState: BruteForceState = {
      attempts: 0,
      lastAttemptTime: 0,
      blockUntil: null,
      complexity: 'normal',
    };
    setState(newState);
    saveState(identifier, newState);
  }, [saveState]);

  const getRequiredComplexity = useCallback((identifier: string) => {
    const storedState = getStoredState(identifier) || state;
    return storedState.complexity;
  }, [getStoredState, state]);

  return {
    recordAttempt,
    resetAttempts,
    getRequiredComplexity,
    state,
  };
} 