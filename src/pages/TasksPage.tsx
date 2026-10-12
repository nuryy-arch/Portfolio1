import React, { useState } from 'react';
import { Plus, CheckSquare } from 'lucide-react';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Dialog } from '../components/Dialog';
import { EmptyState } from '../components/EmptyState';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ErrorState } from '../components/ErrorState';
import { useToast } from '../components/Toast';
import { TaskCard } from '../features/tasks/TaskCard';
import { TaskForm, TaskFormData } from '../features/tasks/TaskForm';
import { TaskFilters } from '../features/tasks/TaskFilters';
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  TaskFiltersState,
} from '../features/tasks/useTasks';
import type { Task } from '../types';

export const TasksPage: React.FC = () => {
  const [filters, setFilters] = useState<TaskFiltersState>({
    status: 'all',
    priority: 'all',
    projectId: 'all',
    sortBy: 'created_at',
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const { data: tasks = [], isLoading, isError, refetch } = useTasks(filters);
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const { success, error: toastError } = useToast();

  const handleCreate = async (data: TaskFormData) => {
    try {
      await createTaskMutation.mutateAsync({
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        due_date: data.due_date ? new Date(data.due_date).toISOString() : null,
        project_id: data.project_id || null,
      });
      success('Task created successfully');
      setIsCreateOpen(false);
    } catch (err: any) {
      toastError(err.message || 'Failed to create task');
    }
  };

  const handleUpdate = async (data: TaskFormData) => {
    if (!editingTask) return;
    try {
      await updateTaskMutation.mutateAsync({
        id: editingTask.id,
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        due_date: data.due_date ? new Date(data.due_date).toISOString() : null,
        project_id: data.project_id || null,
      });
      success('Task updated');
      setEditingTask(null);
    } catch (err: any) {
      toastError(err.message || 'Failed to update task');
    }
  };

  const handleDelete = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTaskMutation.mutateAsync(taskId);
        success('Task deleted');
      } catch (err: any) {
        toastError(err.message || 'Failed to delete task');
      }
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      await updateTaskMutation.mutateAsync({
        id: taskId,
        status: newStatus,
      });
      success(`Task moved to ${newStatus === 'done' ? 'Done' : 'To Do'}`);
    } catch (err: any) {
      toastError(err.message || 'Failed to change task status');
    }
  };

  return (
    <div>
      <Header
        title="Tasks"
        subtitle="Manage, filter and organize all your work items"
        actions={
          <Button size="sm" onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            New Task
          </Button>
        }
      />

      <div className="p-6 sm:p-8 max-w-7xl mx-auto">
        <TaskFilters filters={filters} onChange={setFilters} />

        {isError && (
          <ErrorState
            title="Failed to load tasks"
            message="Could not retrieve your tasks from the database."
            onRetry={() => refetch()}
          />
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <LoadingSkeleton className="h-36" count={6} />
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="No tasks found"
            description="You don't have any tasks matching your filters. Create a new task to get started!"
            actionLabel="Create Task"
            onAction={() => setIsCreateOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={(t) => setEditingTask(t)}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Task"
        description="Add a task to a project or your personal list"
      >
        <TaskForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateOpen(false)}
          isLoading={createTaskMutation.isPending}
        />
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        title="Edit Task"
        description="Modify task details, priority or deadline"
      >
        {editingTask && (
          <TaskForm
            initialValues={editingTask}
            onSubmit={handleUpdate}
            onCancel={() => setEditingTask(null)}
            isLoading={updateTaskMutation.isPending}
          />
        )}
      </Dialog>
    </div>
  );
};
