import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useProfile } from '@/hooks/useProfile';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import { Monitor, Clock, Calendar } from 'lucide-react';

const themeOptions = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
] as const;

const dateFormats = [
  { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY' },
  { value: 'dd/MM/yyyy', label: 'DD/MM/YYYY' },
  { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD' },
] as const;

export function PreferenceSettingsForm() {
  const theme = useTheme();
  const { profile, loading, updateProfile } = useProfile();

  const handlePreferenceChange = async (
    key: string,
    value: string
  ) => {
    if (!profile) return;

    const updatedPreferences = {
      ...profile.preferences,
      [key]: value,
    };

    await updateProfile({ preferences: updatedPreferences });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Theme Settings</CardTitle>
              <p className="mt-1 text-sm text-gray-500">
                Customize your interface appearance
              </p>
            </div>
            <Monitor className="h-5 w-5 text-gray-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handlePreferenceChange('theme', option.value)}
                className={cn(
                  'flex items-center justify-center rounded-lg border p-4 text-sm font-medium',
                  profile?.preferences.theme === option.value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                )}
                disabled={loading}
              >
                {option.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Regional Settings</CardTitle>
              <p className="mt-1 text-sm text-gray-500">
                Configure your timezone and date format
              </p>
            </div>
            <Clock className="h-5 w-5 text-gray-400" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label
              htmlFor="timezone"
              className="block text-sm font-medium text-gray-700"
            >
              Timezone
            </label>
            <select
              id="timezone"
              className={cn(theme.input.base, 'mt-1 w-full')}
              value={profile?.preferences.timezone}
              onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
              disabled={loading}
            >
              {Intl.supportedValuesOf('timeZone').map((tz) => (
                <option key={tz} value={tz}>
                  {tz.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date Format
            </label>
            <div className="mt-2 grid gap-4 sm:grid-cols-3">
              {dateFormats.map((format) => (
                <button
                  key={format.value}
                  onClick={() => handlePreferenceChange('dateFormat', format.value)}
                  className={cn(
                    'flex items-center justify-center rounded-lg border p-4 text-sm font-medium',
                    profile?.preferences.dateFormat === format.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                  disabled={loading}
                >
                  {format.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Date & Time Preview</CardTitle>
              <p className="mt-1 text-sm text-gray-500">
                See how your dates will be displayed
              </p>
            </div>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Current Time</p>
                <p className="mt-1 font-mono text-sm">
                  {new Date().toLocaleTimeString(undefined, {
                    timeZone: profile?.preferences.timezone,
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Current Date</p>
                <p className="mt-1 font-mono text-sm">
                  {new Date().toLocaleDateString(undefined, {
                    timeZone: profile?.preferences.timezone,
                  })}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 