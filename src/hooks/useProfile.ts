import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types/user';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    async function fetchProfile() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        // Set default preferences if they don't exist
        const profileWithDefaults: UserProfile = {
          id: data.id,
          email: data.email,
          fullName: data.full_name || '',
          avatarUrl: data.avatar_url,
          jobTitle: data.job_title,
          company: data.company,
          location: data.location,
          bio: data.bio,
          phone: data.phone,
          website: data.website,
          social: data.social || {
            twitter: null,
            linkedin: null,
            github: null,
          },
          preferences: {
            theme: data.preferences?.theme || 'system',
            timezone: data.preferences?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            dateFormat: data.preferences?.dateFormat || 'MM/dd/yyyy',
            notifications: {
              email: {
                security: data.preferences?.notifications?.email?.security ?? true,
                updates: data.preferences?.notifications?.email?.updates ?? true,
                marketing: data.preferences?.notifications?.email?.marketing ?? false,
              },
              push: {
                security: data.preferences?.notifications?.push?.security ?? true,
                updates: data.preferences?.notifications?.push?.updates ?? true,
              },
              slack: {
                mentions: data.preferences?.notifications?.slack?.mentions ?? true,
                updates: data.preferences?.notifications?.slack?.updates ?? false,
              },
            },
          },
          twoFactorEnabled: data.two_factor_enabled || false,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };

        setProfile(profileWithDefaults);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch profile'));
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');

    try {
      setLoading(true);
      // Convert camelCase to snake_case for database
      const dbUpdates = {
        full_name: updates.fullName,
        avatar_url: updates.avatarUrl,
        job_title: updates.jobTitle,
        company: updates.company,
        location: updates.location,
        bio: updates.bio,
        phone: updates.phone,
        website: updates.website,
        social: updates.social,
        preferences: updates.preferences,
        two_factor_enabled: updates.twoFactorEnabled,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Convert snake_case back to camelCase for the app
      const updatedProfile: UserProfile = {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        avatarUrl: data.avatar_url,
        jobTitle: data.job_title,
        company: data.company,
        location: data.location,
        bio: data.bio,
        phone: data.phone,
        website: data.website,
        social: data.social,
        preferences: data.preferences,
        twoFactorEnabled: data.two_factor_enabled,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      setProfile(updatedProfile);
      toast.success('Profile updated successfully');
      return updatedProfile;
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Failed to update profile');
      throw err instanceof Error ? err : new Error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
  };
} 