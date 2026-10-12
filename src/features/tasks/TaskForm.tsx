import React from 'react';
import { clsx } from 'clsx';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { useProjects } from '../projects/useProjects';
import type { Task, TaskStatus, Priority } from '../../types';

export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(120, 'Title is too long'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done'] as const),
  priority: z.enum(['low', 'medium', 'high', 'urgent'] as const),
  due_date: z.string().optional(),
  project_id: z.string().optional(),
});

export type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  initialValues?: Partial<Task>;
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const { data: projects = [] } = useProjects();

  const formattedDueDate = initialValues?.due_date
    ? new Date(initialValues.due_date).toISOString().split('T')[0]
    : '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: initialValues?.title || '',
      description: initialValues?.description || '',
      status: (initialValues?.status as TaskStatus) || 'todo',
      priority: (initialValues?.priority as Priority) || 'medium',
      due_date: formattedDueDate,
      project_id: initialValues?.project_id || '',
    },
  });

  const projectOptions = [
    { label: 'No Project (Personal)', value: '' },
    ...projects.map((p) => ({ label: p.name, value: p.id })),
  ];

  const statusOptions = [
    { label: 'To Do', value: 'todo' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Done', value: 'done' },
  ];

  const priorityOptions = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
    { label: 'Urgent', value: 'urgent' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Title"
        placeholder="e.g. Implement user authentication"
        error={errors.title?.message}
        {...register('title')}
      />

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">
          Description
        </label>
        <textarea
          rows={3}
          placeholder="Add details, acceptance criteria, or notes..."
          className={clsx(
            'w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/60 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
            errors.description && 'border-danger'
          )}
          {...register('description')}
        />
        {errors.description && (
          <p className="text-xs text-danger font-medium">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Select
          label="Project"
          options={projectOptions}
          error={errors.project_id?.message}
          {...register('project_id')}
        />

        <Input
          label="Due Date"
          type="date"
          error={errors.due_date?.message}
          {...register('due_date')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Select
          label="Status"
          options={statusOptions}
          error={errors.status?.message}
          {...register('status')}
        />

        <Select
          label="Priority"
          options={priorityOptions}
          error={errors.priority?.message}
          {...register('priority')}
        />
      </div>

      <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border mt-6">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" isLoading={isLoading}>
          {initialValues?.id ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};
