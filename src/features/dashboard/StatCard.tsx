import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  isPositive?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'danger';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  change,
  isPositive,
  color = 'primary',
}) => {
  const iconColors = {
    primary: 'bg-primary-light text-primary',
    success: 'bg-success-light text-success-dark',
    warning: 'bg-warning-light text-warning-dark',
    danger: 'bg-danger-light text-danger-dark',
  };

  return (
    <div className="bg-surface p-5 rounded-2xl border border-border shadow-subtle hover:shadow-card transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
          {label}
        </span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconColors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-text-primary">
          {value}
        </span>
        {change && (
          <span
            className={`text-xs font-medium ${
              isPositive ? 'text-success-dark' : 'text-danger'
            }`}
          >
            {change}
          </span>
        )}
      </div>
    </div>
  );
};
