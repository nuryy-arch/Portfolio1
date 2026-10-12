import React from 'react';
import { useAuth } from '../features/auth/AuthContext';
import { Bell, Sparkles } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, actions }) => {
  const { isConfigured } = useAuth();

  return (
    <header className="h-16 px-6 sm:px-8 border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
      <div>
        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
          {title}
          {!isConfigured && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
              <Sparkles className="w-3 h-3" />
              Demo sandbox mode
            </span>
          )}
        </h1>
        {subtitle && (
          <p className="text-xs text-text-secondary mt-0.5 hidden sm:block">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {actions}
        <button
          className="p-2 text-text-secondary hover:text-text-primary hover:bg-slate-100 rounded-lg transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-primary absolute top-2 right-2 ring-2 ring-white" />
        </button>
      </div>
    </header>
  );
};
