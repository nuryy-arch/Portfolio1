import React, { useState } from 'react';
import { User, Shield, Moon, Sun, Globe, LogOut } from 'lucide-react';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { useAuth } from '../features/auth/AuthContext';
import { useToast } from '../components/Toast';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const SettingsPage: React.FC = () => {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { success, error: toastError } = useToast();

  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [isSaving, setIsSaving] = useState(false);
  const [theme, setTheme] = useState<'light' | 'system'>('light');
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  );

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    if (!isSupabaseConfigured) {
      success('Profile updated locally in demo mode');
      setIsSaving(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim(),
          avatar_url: avatarUrl.trim() || null,
        })
        .eq('id', user?.id);

      if (error) {
        toastError(error.message);
      } else {
        await refreshProfile();
        success('Profile updated successfully');
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <Header
        title="Settings"
        subtitle="Manage your profile preferences, identity, and application theme"
      />

      <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-8">
        {/* Profile Card */}
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-subtle">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-border">
            <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-text-primary">Personal Profile</h3>
              <p className="text-xs text-text-secondary">
                Your public identity visible to workspace teammates
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary font-bold text-xl flex items-center justify-center shrink-0 border border-primary/20">
                {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <p className="text-xs font-semibold text-text-primary">Avatar Initials</p>
                <p className="text-[11px] text-text-secondary">
                  Automatically derived from your display name
                </p>
              </div>
            </div>

            <Input
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Alex Morgan"
              required
            />

            <Input
              label="Email Address"
              value={user?.email || 'alex@taskflow.dev'}
              disabled
              helperText="Email cannot be changed directly from here"
            />

            <div className="pt-2">
              <Button type="submit" size="sm" isLoading={isSaving}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>

        {/* Preferences */}
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-subtle">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-border">
            <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-text-primary">App Preferences</h3>
              <p className="text-xs text-text-secondary">
                Customize appearance, theme and localization
              </p>
            </div>
          </div>

          <div className="space-y-4 max-w-lg">
            <Select
              label="Color Theme"
              options={[
                { label: 'Premium Light Minimalism (Default)', value: 'light' },
                { label: 'System Preference', value: 'system' },
              ]}
              value={theme}
              onChange={(e) => {
                setTheme(e.target.value as any);
                success('Theme preference saved');
              }}
            />

            <Select
              label="Timezone"
              options={[
                { label: timezone, value: timezone },
                { label: 'UTC', value: 'UTC' },
                { label: 'America/New_York (EST)', value: 'America/New_York' },
                { label: 'Europe/London (GMT)', value: 'Europe/London' },
                { label: 'Europe/Paris (CET)', value: 'Europe/Paris' },
                { label: 'Asia/Tokyo (JST)', value: 'Asia/Tokyo' },
              ]}
              value={timezone}
              onChange={(e) => {
                setTimezone(e.target.value);
                success('Timezone updated');
              }}
            />
          </div>
        </div>

        {/* Account Security & Sign Out */}
        <div className="bg-surface rounded-2xl border border-danger/20 p-6 shadow-subtle">
          <div className="flex items-center gap-3 pb-4 mb-4 border-b border-border">
            <div className="w-10 h-10 rounded-xl bg-danger-light flex items-center justify-center text-danger">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-text-primary">Session & Security</h3>
              <p className="text-xs text-text-secondary">
                End current active session safely
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-text-primary">Sign out of TASKFLOW</p>
              <p className="text-xs text-text-secondary">
                You will be returned to the sign-in screen
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => signOut()}
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
