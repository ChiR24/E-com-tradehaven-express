import React from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

export function GeneralSettingsForm() {
  const theme = useTheme();
  const { profile, loading, updateProfile } = useProfile();
  const [formData, setFormData] = React.useState({
    fullName: profile?.fullName || '',
    jobTitle: profile?.jobTitle || '',
    company: profile?.company || '',
    bio: profile?.bio || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-gray-700"
          >
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            className={cn(
              theme.input.base,
              'mt-1 block w-full',
              theme.animation.hover
            )}
            disabled={loading}
          />
        </div>

        <div>
          <label
            htmlFor="jobTitle"
            className="block text-sm font-medium text-gray-700"
          >
            Job Title
          </label>
          <input
            type="text"
            id="jobTitle"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={(e) =>
              setFormData({ ...formData, jobTitle: e.target.value })
            }
            className={cn(
              theme.input.base,
              'mt-1 block w-full',
              theme.animation.hover
            )}
            disabled={loading}
          />
        </div>

        <div>
          <label
            htmlFor="company"
            className="block text-sm font-medium text-gray-700"
          >
            Company
          </label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={(e) =>
              setFormData({ ...formData, company: e.target.value })
            }
            className={cn(
              theme.input.base,
              'mt-1 block w-full',
              theme.animation.hover
            )}
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="bio"
          className="block text-sm font-medium text-gray-700"
        >
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          className={cn(
            theme.input.base,
            'mt-1 block w-full resize-none',
            theme.animation.hover
          )}
          disabled={loading}
        />
        <p className="mt-2 text-sm text-gray-500">
          Brief description for your profile.
        </p>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          className={cn(
            'px-4 py-2 text-sm',
            theme.button.secondary,
            theme.animation.hover
          )}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={cn(
            'px-4 py-2 text-sm',
            theme.button.primary,
            theme.animation.hover,
            loading && 'opacity-50 cursor-not-allowed'
          )}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
} 