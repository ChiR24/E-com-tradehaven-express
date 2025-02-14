import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useProfile } from '@/hooks/useProfile';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import { Bell, Mail, MessageSquare, Slack } from 'lucide-react';
import { NotificationPreferences } from '@/types/profile';

type NotificationSetting<T extends keyof NotificationPreferences> = {
  type: T;
  setting: keyof NotificationPreferences[T];
};

type NotificationValue<
  T extends keyof NotificationPreferences,
  K extends keyof NotificationPreferences[T]
> = NotificationPreferences[T][K];

export function NotificationSettingsForm() {
  const theme = useTheme();
  const { profile, loading, updateProfile } = useProfile();

  const handleToggle = async <
    T extends keyof NotificationPreferences,
    K extends keyof NotificationPreferences[T]
  >(
    type: T,
    setting: K,
    value: NotificationValue<T, K>
  ) => {
    if (!profile) return;

    const updatedPreferences = {
      ...profile.preferences,
      notifications: {
        ...profile.preferences.notifications,
        [type]: {
          ...profile.preferences.notifications[type],
          [setting]: value,
        },
      },
    };

    await updateProfile({ preferences: updatedPreferences });
  };

  const NotificationToggle = <
    T extends keyof NotificationPreferences,
    K extends keyof NotificationPreferences[T]
  >({
    label,
    description,
    type,
    setting,
    icon: Icon,
  }: {
    label: string;
    description: string;
    type: T;
    setting: K;
    icon: React.ElementType;
  }) => {
    const isEnabled = profile?.preferences.notifications[type]?.[setting] ?? false;

    return (
      <div className="flex items-start space-x-4 rounded-lg border p-4">
        <div className={cn(
          'rounded-lg p-2',
          isEnabled ? 'bg-primary-50 text-primary-600' : 'bg-gray-100 text-gray-500'
        )}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">{label}</h4>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                className={theme.input.checkbox}
                checked={!!isEnabled}
                onChange={(e) => handleToggle(type, setting, e.target.checked as NotificationValue<T, K>)}
                disabled={loading}
              />
            </label>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Email Notifications</CardTitle>
              <p className="mt-1 text-sm text-gray-500">
                Manage your email notification preferences
              </p>
            </div>
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <NotificationToggle<'email', 'security'>
            label="Security Alerts"
            description="Get notified about security-related events"
            type="email"
            setting="security"
            icon={Bell}
          />
          <NotificationToggle<'email', 'updates'>
            label="Product Updates"
            description="Stay informed about new features and improvements"
            type="email"
            setting="updates"
            icon={MessageSquare}
          />
          <NotificationToggle<'email', 'marketing'>
            label="Marketing"
            description="Receive news and promotional materials"
            type="email"
            setting="marketing"
            icon={Mail}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Push Notifications</CardTitle>
              <p className="mt-1 text-sm text-gray-500">
                Configure browser push notifications
              </p>
            </div>
            <Bell className="h-5 w-5 text-gray-400" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <NotificationToggle<'push', 'security'>
            label="Security Alerts"
            description="Get instant alerts about security events"
            type="push"
            setting="security"
            icon={Bell}
          />
          <NotificationToggle<'push', 'updates'>
            label="Product Updates"
            description="Get notified about new features"
            type="push"
            setting="updates"
            icon={MessageSquare}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Slack Integration</CardTitle>
              <p className="mt-1 text-sm text-gray-500">
                Connect with Slack for notifications
              </p>
            </div>
            <Slack className="h-5 w-5 text-gray-400" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <NotificationToggle<'slack', 'enabled'>
              label="Enable Slack Notifications"
              description="Send notifications to your Slack workspace"
              type="slack"
              setting="enabled"
              icon={Slack}
            />
            {profile?.preferences.notifications.slack?.enabled && (
              <>
                <div>
                  <label
                    htmlFor="webhook"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Webhook URL
                  </label>
                  <input
                    type="text"
                    id="webhook"
                    className={cn(theme.input.base, 'mt-1 w-full')}
                    value={profile?.preferences.notifications.slack?.webhook || ''}
                    onChange={(e) =>
                      handleToggle('slack', 'webhook' as const, e.target.value)
                    }
                    placeholder="https://hooks.slack.com/..."
                    disabled={loading}
                  />
                </div>
                <div>
                  <label
                    htmlFor="channel"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Channel
                  </label>
                  <input
                    type="text"
                    id="channel"
                    className={cn(theme.input.base, 'mt-1 w-full')}
                    value={profile?.preferences.notifications.slack?.channel || ''}
                    onChange={(e) =>
                      handleToggle('slack', 'channel' as const, e.target.value)
                    }
                    placeholder="#notifications"
                    disabled={loading}
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 