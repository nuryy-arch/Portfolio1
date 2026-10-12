import React from 'react';
import { Calendar, FolderKanban, CheckCircle2, Clock, Trash2, Edit3 } from 'lucide-react';
import { Badge } from '../../components/Badge';
import type { Task } from '../../types';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onStatusChange?: (taskId: string, status: Task['status']) => void;
  isDragging?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  isDragging = false,
}) => {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';

  const formattedDate = task.due_date
    ? new Date(task.due_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <div
      className={`group relative rounded-xl border bg-surface p-4 transition-all duration-150 ${
        isDragging
          ? 'shadow-modal border-primary rotate-1 scale-105'
          : 'border-border shadow-subtle hover:border-slate-300 hover:shadow-card'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <Badge priority={task.priority} size="sm" />
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={() => onEdit(task)}
              className="p-1 rounded text-text-secondary hover:text-text-primary hover:bg-slate-100"
              title="Edit task"
              aria-label="Edit task"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(task.id)}
              className="p-1 rounded text-text-secondary hover:text-danger hover:bg-danger-light"
              title="Delete task"
              aria-label="Delete task"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <h4
        className={`text-sm font-semibold text-text-primary line-clamp-2 leading-snug mb-1.5 ${
          task.status === 'done' ? 'line-through text-text-secondary/70' : ''
        }`}
      >
        {task.title}
      </h4>

      {task.description && (
        <p className="text-xs text-text-secondary line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-text-secondary">
        <div className="flex items-center gap-1.5 truncate max-w-[130px]">
          {task.project ? (
            <span className="flex items-center gap-1 truncate text-primary font-medium">
              <FolderKanban className="w-3 h-3 shrink-0" />
              <span className="truncate">{task.project.name}</span>
            </span>
          ) : (
            <span className="text-slate-400">Personal</span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {formattedDate && (
            <span
              className={`flex items-center gap-1 ${
                isOverdue ? 'text-danger font-semibold' : 'text-text-secondary'
              }`}
              title={isOverdue ? 'Overdue!' : 'Due date'}
            >
              {isOverdue ? <Clock className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
              {formattedDate}
            </span>
          )}

          {onStatusChange && (
            <button
              onClick={() =>
                onStatusChange(task.id, task.status === 'done' ? 'todo' : 'done')
              }
              className={`p-1 rounded-full transition-colors ${
                task.status === 'done'
                  ? 'text-success hover:text-text-secondary'
                  : 'text-slate-300 hover:text-success'
              }`}
              title={task.status === 'done' ? 'Mark incomplete' : 'Mark done'}
              aria-label={task.status === 'done' ? 'Mark incomplete' : 'Mark done'}
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
