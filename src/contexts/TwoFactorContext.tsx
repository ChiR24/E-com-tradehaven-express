import { createContext, useContext, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TwoFactorContextType {
  isEnabled: boolean;
  isEnabling: boolean;
  verificationCode: string;
  setVerificationCode: (code: string) => void;
  enableTwoFactor: () => Promise<void>;
  verifyTwoFactor: () => Promise<void>;
  disableTwoFactor: () => Promise<void>;
}

const TwoFactorContext = createContext<TwoFactorContextType | undefined>(undefined);

export function TwoFactorProvider({ children }: { children: React.ReactNode }) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [secret, setSecret] = useState<string | null>(null);

  const enableTwoFactor = async () => {
    try {
      setIsEnabling(true);
      const { data, error } = await supabase.rpc('enable_2fa');
      if (error) throw error;

      setSecret(data.secret);
      toast.success('Two-factor authentication setup initiated. Please verify the code.');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsEnabling(false);
    }
  };

  const verifyTwoFactor = async () => {
    if (!secret || !verificationCode) return;

    try {
      const { error } = await supabase.rpc('verify_2fa', {
        token: verificationCode,
        secret_key: secret
      });

      if (error) throw error;

      setIsEnabled(true);
      setSecret(null);
      setVerificationCode('');
      toast.success('Two-factor authentication enabled successfully.');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const disableTwoFactor = async () => {
    try {
      const { error } = await supabase.rpc('disable_2fa');
      if (error) throw error;

      setIsEnabled(false);
      toast.success('Two-factor authentication disabled successfully.');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <TwoFactorContext.Provider
      value={{
        isEnabled,
        isEnabling,
        verificationCode,
        setVerificationCode,
        enableTwoFactor,
        verifyTwoFactor,
        disableTwoFactor,
      }}
    >
      {children}
    </TwoFactorContext.Provider>
  );
}

export function useTwoFactor() {
  const context = useContext(TwoFactorContext);
  if (context === undefined) {
    throw new Error('useTwoFactor must be used within a TwoFactorProvider');
  }
  return context;
} 