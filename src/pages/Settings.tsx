import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Bell,
  Moon,
  Sun,
  Monitor,
  Globe,
  Clock,
  Shield,
  Key,
  Smartphone,
  LogOut,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Settings() {
  const theme = useTheme();
  const { profile, loading, updateProfile } = useProfile();
  const { signOut, updatePassword } = useAuth();

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    if (!profile) return;

    try {
      await updateProfile({
        preferences: {
          ...profile.preferences,
          theme: newTheme,
        },
      });
      toast.success('Theme updated successfully');
    } catch (error) {
      toast.error('Failed to update theme');
    }
  };

  const handleNotificationToggle = async (
    type: 'email' | 'push' | 'slack',
    setting: string,
    value: boolean
  ) => {
    if (!profile) return;

    try {
      await updateProfile({
        preferences: {
          ...profile.preferences,
          notifications: {
            ...profile.preferences.notifications,
            [type]: {
              ...profile.preferences.notifications[type],
              [setting]: value,
            },
          },
        },
      });
      toast.success('Notification settings updated');
    } catch (error) {
      toast.error('Failed to update notification settings');
    }
  };

  const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
    try {
      await updatePassword(newPassword);
      toast.success('Password updated successfully');
    } catch (error) {
      toast.error('Failed to update password');
    }
  };

  const handleDeleteAccount = async () => {
    // Implement account deletion logic
    toast.error('Account deletion not implemented');
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <h1 className="mb-8 text-3xl font-bold">Settings</h1>

      <Tabs defaultValue="appearance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            <span>Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span>Preferences</span>
          </TabsTrigger>
        </TabsList>

        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <label className="text-sm font-medium">Theme</label>
                <div className="flex gap-4">
                  <Button
                    variant={profile?.preferences.theme === 'light' ? 'default' : 'outline'}
                    className="flex items-center gap-2"
                    onClick={() => handleThemeChange('light')}
                  >
                    <Sun className="h-4 w-4" />
                    Light
                  </Button>
                  <Button
                    variant={profile?.preferences.theme === 'dark' ? 'default' : 'outline'}
                    className="flex items-center gap-2"
                    onClick={() => handleThemeChange('dark')}
                  >
                    <Moon className="h-4 w-4" />
                    Dark
                  </Button>
                  <Button
                    variant={profile?.preferences.theme === 'system' ? 'default' : 'outline'}
                    className="flex items-center gap-2"
                    onClick={() => handleThemeChange('system')}
                  >
                    <Monitor className="h-4 w-4" />
                    System
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Security Alerts</p>
                      <p className="text-sm text-gray-500">
                        Get notified about security-related events
                      </p>
                    </div>
                    <Switch
                      checked={profile?.preferences.notifications.email.security}
                      onCheckedChange={(checked) =>
                        handleNotificationToggle('email', 'security', checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Product Updates</p>
                      <p className="text-sm text-gray-500">
                        Stay informed about new features
                      </p>
                    </div>
                    <Switch
                      checked={profile?.preferences.notifications.email.updates}
                      onCheckedChange={(checked) =>
                        handleNotificationToggle('email', 'updates', checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Marketing</p>
                      <p className="text-sm text-gray-500">
                        Receive news and promotional materials
                      </p>
                    </div>
                    <Switch
                      checked={profile?.preferences.notifications.email.marketing}
                      onCheckedChange={(checked) =>
                        handleNotificationToggle('email', 'marketing', checked)
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Push Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Security Alerts</p>
                      <p className="text-sm text-gray-500">
                        Get instant alerts about security events
                      </p>
                    </div>
                    <Switch
                      checked={profile?.preferences.notifications.push.security}
                      onCheckedChange={(checked) =>
                        handleNotificationToggle('push', 'security', checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Product Updates</p>
                      <p className="text-sm text-gray-500">
                        Get notified about new features
                      </p>
                    </div>
                    <Switch
                      checked={profile?.preferences.notifications.push.updates}
                      onCheckedChange={(checked) =>
                        handleNotificationToggle('push', 'updates', checked)
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Password</label>
                  <Input type="password" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Password</label>
                  <Input type="password" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirm New Password</label>
                  <Input type="password" />
                </div>
                <Button>Update Password</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch checked={profile?.twoFactorEnabled} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Smartphone className="h-8 w-8 text-gray-400" />
                    <div>
                      <p className="font-medium">Current Device</p>
                      <p className="text-sm text-gray-500">
                        Last active: Just now
                      </p>
                    </div>
                  </div>
                  <Badge>Current</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-error-200 bg-error-50">
              <CardHeader>
                <CardTitle className="text-error-900">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-error-900">Delete Account</p>
                    <p className="text-sm text-error-700">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    className="flex items-center gap-2"
                    onClick={handleDeleteAccount}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Preferences Settings */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Regional Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Timezone</label>
                  <Select
                    value={profile?.preferences.timezone}
                    onValueChange={(value) =>
                      updateProfile({
                        preferences: {
                          ...profile?.preferences,
                          timezone: value,
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        'UTC',
                        'America/New_York',
                        'America/Chicago',
                        'America/Denver',
                        'America/Los_Angeles',
                        'Europe/London',
                        'Europe/Paris',
                        'Europe/Berlin',
                        'Asia/Tokyo',
                        'Asia/Shanghai',
                        'Australia/Sydney',
                      ].map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Format</label>
                  <Select
                    value={profile?.preferences.dateFormat}
                    onValueChange={(value) =>
                      updateProfile({
                        preferences: {
                          ...profile?.preferences,
                          dateFormat: value,
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/dd/yyyy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="dd/MM/yyyy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="yyyy-MM-dd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 