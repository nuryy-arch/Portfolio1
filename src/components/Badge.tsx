import React from 'react';
import { clsx } from 'clsx';
import type { Priority, TaskStatus } from '../types';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
  status?: TaskStatus;
  priority?: Priority;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant,
  status,
  priority,
  size = 'md',
}) => {
  let computedVariant = variant || 'default';

  if (status) {
    switch (status) {
      case 'todo':
        computedVariant = 'neutral';
        break;
      case 'in_progress':
        computedVariant = 'primary';
        break;
      case 'done':
        computedVariant = 'success';
        break;
    }
  }

  if (priority) {
    switch (priority) {
      case 'low':
        computedVariant = 'neutral';
        break;
      case 'medium':
        computedVariant = 'primary';
        break;
      case 'high':
        computedVariant = 'warning';
        break;
      case 'urgent':
        computedVariant = 'danger';
        break;
    }
  }

  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-primary-light text-primary border-primary/20',
    success: 'bg-success-light text-success-dark border-success/30',
    warning: 'bg-warning-light text-warning-dark border-warning/30',
    danger: 'bg-danger-light text-danger-dark border-danger/30',
    neutral: 'bg-slate-100 text-text-secondary border-slate-200',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
  };

  const displayContent = children || (status ? {
    todo: 'To Do',
    in_progress: 'In Progress',
    done: 'Done'
  }[status] : priority ? {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent'
  }[priority] : null);

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border tracking-wide uppercase',
        variantStyles[computedVariant],
        sizeStyles[size]
      )}
    >
      {displayContent}
    </span>
  );
};
