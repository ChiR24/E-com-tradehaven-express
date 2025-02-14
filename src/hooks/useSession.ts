import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface SessionConfig {
  inactivityTimeout?: number; // in minutes
  sessionDuration?: number; // in minutes
  enableInactivityCheck?: boolean;
  enableSessionExpiry?: boolean;
}

export function useSession(config: SessionConfig = {}) {
  const {
    inactivityTimeout = 30,
    sessionDuration = 480, // 8 hours
    enableInactivityCheck = true,
    enableSessionExpiry = true,
  } = config;

  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [sessionStartTime] = useState<number>(Date.now());

  const resetActivity = () => {
    setLastActivity(Date.now());
  };

  const checkInactivity = () => {
    const now = Date.now();
    const inactiveTime = now - lastActivity;
    const inactivityMs = inactivityTimeout * 60 * 1000;

    if (inactiveTime > inactivityMs) {
      handleSessionEnd('inactivity');
    }
  };

  const checkSessionDuration = () => {
    const now = Date.now();
    const sessionTime = now - sessionStartTime;
    const sessionDurationMs = sessionDuration * 60 * 1000;

    if (sessionTime > sessionDurationMs) {
      handleSessionEnd('expiry');
    }
  };

  const handleSessionEnd = async (reason: 'inactivity' | 'expiry') => {
    await signOut();
    navigate('/auth', {
      state: {
        message:
          reason === 'inactivity'
            ? 'Session ended due to inactivity'
            : 'Session expired',
      },
    });
  };

  useEffect(() => {
    if (!user) return;

    // Activity listeners
    const activityEvents = [
      'mousedown',
      'keydown',
      'scroll',
      'touchstart',
      'mousemove',
    ];

    const handleActivity = () => {
      resetActivity();
    };

    if (enableInactivityCheck) {
      activityEvents.forEach((event) => {
        window.addEventListener(event, handleActivity);
      });
    }

    // Check intervals
    let inactivityInterval: number;
    let sessionInterval: number;

    if (enableInactivityCheck) {
      inactivityInterval = window.setInterval(
        checkInactivity,
        60 * 1000 // Check every minute
      );
    }

    if (enableSessionExpiry) {
      sessionInterval = window.setInterval(
        checkSessionDuration,
        60 * 1000 // Check every minute
      );
    }

    return () => {
      if (enableInactivityCheck) {
        activityEvents.forEach((event) => {
          window.removeEventListener(event, handleActivity);
        });
        clearInterval(inactivityInterval);
      }

      if (enableSessionExpiry) {
        clearInterval(sessionInterval);
      }
    };
  }, [user]);

  return {
    resetActivity,
    lastActivity,
    sessionStartTime,
  };
} 