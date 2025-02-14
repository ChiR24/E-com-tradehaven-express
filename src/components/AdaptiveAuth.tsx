import { useEffect, useState } from 'react';
import { useDeviceTrust } from '@/hooks/useDeviceTrust';
import { useBiometric } from '@/hooks/useBiometric';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface AdaptiveAuthProps {
  onSuccess: () => void;
  onCancel: () => void;
  userId: string;
  username: string;
}

export function AdaptiveAuth({ onSuccess, onCancel, userId, username }: AdaptiveAuthProps) {
  const { trustScore, calculateTrustScore, registerDevice } = useDeviceTrust();
  const biometric = useBiometric();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'check' | 'register' | 'verify'>('check');

  useEffect(() => {
    biometric.checkSupport();
    calculateTrustScore();
  }, [biometric, calculateTrustScore]);

  const handleRegisterDevice = async () => {
    setLoading(true);
    try {
      await registerDevice();
      const newScore = await calculateTrustScore();
      
      if (newScore.score >= 60) {
        // If trust score is high enough after registration, proceed
        onSuccess();
      } else {
        // Otherwise, require additional verification
        setStep('verify');
      }
    } catch (error) {
      toast.error('Failed to register device');
      setStep('verify');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricAuth = async () => {
    setLoading(true);
    try {
      if (!biometric.isEnabled) {
        await biometric.registerBiometric(userId, username);
        toast.success('Biometric authentication enabled');
      }
      await biometric.authenticateWithBiometric();
      onSuccess();
    } catch (error) {
      toast.error('Biometric authentication failed');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'check') {
    // Initial check
    if (trustScore.score >= 80) {
      // High trust score, proceed automatically
      onSuccess();
      return null;
    } else if (trustScore.score >= 60) {
      // Medium trust score, require biometric
      setStep('verify');
    } else {
      // Low trust score, require device registration
      setStep('register');
    }
  }

  if (step === 'register') {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold">New Device Detected</h3>
          <p className="text-sm text-gray-500">
            We don't recognize this device. Would you like to register it?
          </p>
        </div>

        <div className="space-y-2">
          <Button
            onClick={handleRegisterDevice}
            className="w-full"
            disabled={loading}
          >
            Register Device
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            className="w-full"
            disabled={loading}
          >
            Cancel
          </Button>
        </div>

        <div className="text-xs text-gray-500">
          <h4 className="font-semibold">Trust Score Factors:</h4>
          <ul className="mt-1 space-y-1">
            {Object.entries(trustScore.factors).map(([factor, value]) => (
              <li key={factor} className={value ? 'text-green-500' : 'text-red-500'}>
                • {factor.replace(/([A-Z])/g, ' $1').trim()}: {value ? 'Yes' : 'No'}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (step === 'verify') {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Additional Verification Required</h3>
          <p className="text-sm text-gray-500">
            Please verify your identity using biometric authentication.
          </p>
        </div>

        {biometric.isAvailable ? (
          <div className="space-y-2">
            <Button
              onClick={handleBiometricAuth}
              className="w-full"
              disabled={loading}
            >
              Use Biometric Authentication
            </Button>
            <Button
              onClick={onCancel}
              variant="outline"
              className="w-full"
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="text-center text-red-500">
            <p>Biometric authentication is not available on this device.</p>
            <Button
              onClick={onCancel}
              variant="outline"
              className="mt-2"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    );
  }

  return null;
} 