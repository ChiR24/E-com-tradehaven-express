import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { generateRandomString } from '@/lib/utils';

interface RecoveryCode {
  code: string;
  used: boolean;
  created_at: string;
}

export function useRecoveryCodes() {
  const [codes, setCodes] = useState<RecoveryCode[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const generateRecoveryCodes = useCallback(async () => {
    setLoading(true);
    try {
      const newCodes: RecoveryCode[] = Array.from({ length: 10 }, () => ({
        code: generateRandomString(12).match(/.{1,4}/g)?.join('-') || '',
        used: false,
        created_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('recovery_codes')
        .upsert(
          newCodes.map(code => ({
            user_id: user?.id,
            ...code,
          }))
        );

      if (error) throw error;

      setCodes(newCodes);
      toast.success('Recovery codes generated successfully');
      return newCodes;
    } catch (error) {
      toast.error('Failed to generate recovery codes');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadRecoveryCodes = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('recovery_codes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCodes(data);
      return data;
    } catch (error) {
      toast.error('Failed to load recovery codes');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const verifyRecoveryCode = useCallback(async (code: string) => {
    if (!user) return false;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('recovery_codes')
        .select('*')
        .eq('user_id', user.id)
        .eq('code', code)
        .eq('used', false)
        .single();

      if (error) return false;

      if (data) {
        await supabase
          .from('recovery_codes')
          .update({ used: true })
          .eq('code', code);

        return true;
      }

      return false;
    } catch (error) {
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    codes,
    loading,
    generateRecoveryCodes,
    loadRecoveryCodes,
    verifyRecoveryCode,
  };
} 