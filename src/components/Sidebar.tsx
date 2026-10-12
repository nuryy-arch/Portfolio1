import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Kanban, 
  FolderKanban, 
  BarChart3, 
  Settings, 
  LogOut,
  Layers
} from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';
import { clsx } from 'clsx';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Tasks', path: '/tasks', icon: CheckSquare },
  { name: 'Board', path: '/board', icon: Kanban },
  { name: 'Projects', path: '/projects', icon: FolderKanban },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { profile, signOut } = useAuth();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-surface border-r border-border h-screen sticky top-0 shrink-0 select-none">
      {/* Brand logo & name */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-border">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm shadow-primary/30">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-base tracking-tight text-text-primary block leading-none">
            TASKFLOW
          </span>
          <span className="text-[10px] text-text-secondary tracking-wider font-semibold uppercase mt-0.5 block">
            SaaS Workspace
          </span>
        </div>
      </div>

      {/* Nav items */}
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
          Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-primary-light text-primary shadow-subtle font-semibold'
                    : 'text-text-secondary hover:text-text-primary hover:bg-slate-50'
                )
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* User profile preview & signout */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
              {profile?.display_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-text-primary truncate">
                {profile?.display_name || 'My Account'}
              </p>
              <p className="text-[10px] text-text-secondary truncate">Online</p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            title="Sign out"
            className="p-1.5 rounded-lg text-text-secondary hover:text-danger hover:bg-danger-light/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
