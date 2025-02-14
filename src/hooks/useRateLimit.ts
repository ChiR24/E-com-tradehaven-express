import { useState, useCallback } from 'react';

interface RateLimitConfig {
  maxAttempts?: number;
  timeWindow?: number; // in seconds
  blockDuration?: number; // in seconds
}

interface Attempt {
  timestamp: number;
  ip?: string;
}

export function useRateLimit(config: RateLimitConfig = {}) {
  const {
    maxAttempts = 5,
    timeWindow = 300, // 5 minutes
    blockDuration = 900, // 15 minutes
  } = config;

  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null);

  const cleanOldAttempts = useCallback(() => {
    const now = Date.now();
    const windowStart = now - timeWindow * 1000;
    setAttempts((prev) => prev.filter((attempt) => attempt.timestamp > windowStart));
  }, [timeWindow]);

  const isBlocked = useCallback(() => {
    if (!blockedUntil) return false;
    return Date.now() < blockedUntil;
  }, [blockedUntil]);

  const getRemainingBlockTime = useCallback(() => {
    if (!blockedUntil) return 0;
    const remaining = Math.max(0, blockedUntil - Date.now());
    return Math.ceil(remaining / 1000); // Convert to seconds
  }, [blockedUntil]);

  const recordAttempt = useCallback(
    async (ip?: string) => {
      if (isBlocked()) {
        throw new Error(`Too many attempts. Please try again in ${getRemainingBlockTime()} seconds.`);
      }

      cleanOldAttempts();

      const newAttempt: Attempt = {
        timestamp: Date.now(),
        ip,
      };

      setAttempts((prev) => [...prev, newAttempt]);

      if (attempts.length + 1 >= maxAttempts) {
        const blockUntilTime = Date.now() + blockDuration * 1000;
        setBlockedUntil(blockUntilTime);
        throw new Error(`Too many attempts. Please try again in ${blockDuration} seconds.`);
      }
    },
    [attempts.length, blockDuration, cleanOldAttempts, getRemainingBlockTime, isBlocked, maxAttempts]
  );

  const reset = useCallback(() => {
    setAttempts([]);
    setBlockedUntil(null);
  }, []);

  return {
    recordAttempt,
    isBlocked,
    getRemainingBlockTime,
    reset,
    attempts: attempts.length,
  };
} 