import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useProfile } from '@/hooks/useProfile';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import { SecuritySettings } from '@/types/profile';
import { 
  Shield, 
  LogIn, 
  LogOut, 
  Key, 
  AlertTriangle,
  Check,
  X,
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'login' | 'logout' | 'password_change' | 'security_alert' | 'api_key';
  status: 'success' | 'failed';
  timestamp: Date;
  details: {
    location?: string;
    deviceName?: string;
    browser?: string;
    ip?: string;
    message?: string;
  };
}

const activityIcons = {
  login: LogIn,
  logout: LogOut,
  password_change: Key,
  security_alert: AlertTriangle,
  api_key: Key,
};

const statusIcons = {
  success: Check,
  failed: X,
};

const statusStyles = {
  success: 'bg-success-50 text-success-700',
  failed: 'bg-error-50 text-error-700',
};

export function ActivityLogList() {
  const theme = useTheme();
  const { profile } = useProfile();
  const [activities, setActivities] = React.useState<ActivityItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<ActivityItem['type'] | 'all'>('all');

  React.useEffect(() => {
    // Fetch activities from your backend
    // This is a mock implementation
    const mockActivities: ActivityItem[] = [
      {
        id: '1',
        type: 'login',
        status: 'success',
        timestamp: new Date(),
        details: {
          location: 'New York, US',
          deviceName: 'Chrome on MacBook Pro',
          ip: '192.168.1.1',
        },
      },
      {
        id: '2',
        type: 'security_alert',
        status: 'failed',
        timestamp: new Date(Date.now() - 3600000),
        details: {
          message: 'Failed login attempt from unknown device',
          location: 'London, UK',
          ip: '192.168.1.2',
        },
      },
      // Add more mock activities
    ];

    setActivities(mockActivities);
    setLoading(false);
  }, []);

  const filteredActivities = React.useMemo(() => {
    return filter === 'all'
      ? activities
      : activities.filter((activity) => activity.type === filter);
  }, [activities, filter]);

  const ActivityIcon = ({ type, className }: { type: ActivityItem['type']; className?: string }) => {
    const Icon = activityIcons[type];
    return <Icon className={cn('h-5 w-5', className)} />;
  };

  const StatusIcon = ({ status, className }: { status: ActivityItem['status']; className?: string }) => {
    const Icon = statusIcons[status];
    return <Icon className={cn('h-4 w-4', className)} />;
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex space-x-2">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            'rounded-lg px-3 py-1 text-sm font-medium',
            filter === 'all'
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-500 hover:bg-gray-100'
          )}
        >
          All
        </button>
        {Object.keys(activityIcons).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type as ActivityItem['type'])}
            className={cn(
              'flex items-center space-x-1 rounded-lg px-3 py-1 text-sm font-medium',
              filter === type
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-500 hover:bg-gray-100'
            )}
          >
            <ActivityIcon type={type as ActivityItem['type']} className="h-4 w-4" />
            <span>{type.replace('_', ' ').toUpperCase()}</span>
          </button>
        ))}
      </div>

      {/* Activity List */}
      <div className="space-y-4">
        {filteredActivities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start space-x-4 rounded-lg border p-4"
          >
            <div className={cn(
              'rounded-full p-2',
              activity.status === 'success' ? 'bg-success-50' : 'bg-error-50'
            )}>
              <ActivityIcon
                type={activity.type}
                className={cn(
                  activity.status === 'success' ? 'text-success-600' : 'text-error-600'
                )}
              />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">
                    {activity.type.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                    statusStyles[activity.status]
                  )}>
                    <StatusIcon status={activity.status} className="mr-1" />
                    {activity.status.toUpperCase()}
                  </span>
                </div>
                <time className="text-sm text-gray-500">
                  {activity.timestamp.toLocaleString()}
                </time>
              </div>
              <div className="text-sm text-gray-500">
                {activity.details.message && (
                  <p>{activity.details.message}</p>
                )}
                <p>
                  {activity.details.location && (
                    <span className="mr-3">📍 {activity.details.location}</span>
                  )}
                  {activity.details.deviceName && (
                    <span className="mr-3">💻 {activity.details.deviceName}</span>
                  )}
                  {activity.details.ip && (
                    <span>🌐 {activity.details.ip}</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        ))}

        {filteredActivities.length === 0 && (
          <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900">No activities found</p>
              <p className="mt-1 text-sm text-gray-500">
                {filter === 'all'
                  ? 'No recent activities to display'
                  : `No ${filter.replace('_', ' ')} activities found`}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 