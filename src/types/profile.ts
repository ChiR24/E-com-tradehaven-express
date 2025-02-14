import { User } from '@supabase/supabase-js';

export interface UserProfile extends Omit<User, 'app_metadata' | 'user_metadata'> {
  fullName: string;
  avatar?: string;
  jobTitle?: string;
  company?: string;
  bio?: string;
  role: 'admin' | 'user' | 'viewer';
  location?: string;
  phone?: string;
  website?: string;
  social?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: NotificationPreferences;
    timezone: string;
    dateFormat: string;
  };
  lastLogin?: Date;
  twoFactorEnabled: boolean;
}

export interface ProfileUpdateData extends Partial<Omit<UserProfile, 'id' | 'email' | 'role'>> {}

export interface SecuritySettings {
  userId: string;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  passwordLastChanged?: Date;
  activeDevices: Array<{
    id: string;
    deviceName: string;
    browser: string;
    lastActive: Date;
    location?: string;
  }>;
  loginHistory: Array<{
    timestamp: Date;
    ip: string;
    location?: string;
    deviceName: string;
    status: 'success' | 'failed';
  }>;
}

export interface ApiKey {
  id: string;
  userId: string;
  name: string;
  key: string;
  createdAt: Date;
  lastUsed?: Date;
  scopes?: string[];
}

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
    enabled: boolean;
    webhook?: string;
    channel?: string;
  };
} 