export interface NotificationPreferences {
  email: {
    security: boolean;
    updates: boolean;
    marketing: boolean;
  };
  push: {
    security: boolean;
    updates: boolean;
  };
  slack: {
    mentions: boolean;
    updates: boolean;
  };
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  timezone: string;
  dateFormat: string;
  notifications: NotificationPreferences;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  jobTitle?: string;
  company?: string;
  location?: string;
  bio?: string;
  phone?: string;
  website?: string;
  social?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  preferences: UserPreferences;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
} 