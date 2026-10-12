import React, { useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Plus, Kanban as KanbanIcon } from 'lucide-react';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Dialog } from '../components/Dialog';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ErrorState } from '../components/ErrorState';
import { useToast } from '../components/Toast';
import { KanbanColumn } from '../features/tasks/KanbanColumn';
import { TaskForm, TaskFormData } from '../features/tasks/TaskForm';
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
} from '../features/tasks/useTasks';
import type { Task, TaskStatus } from '../types';

export const BoardPage: React.FC = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [defaultColumnStatus, setDefaultColumnStatus] = useState<TaskStatus>('todo');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const { data: tasks = [], isLoading, isError, refetch } = useTasks();
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const { success, error: toastError } = useToast();

  const todoTasks = tasks.filter((t) => t.status === 'todo');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const doneTasks = tasks.filter((t) => t.status === 'done');

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as TaskStatus;

    // Optimistic UI mutation
    try {
      await updateTaskMutation.mutateAsync({
        id: draggableId,
        status: newStatus,
        position: destination.index,
      });
      success(`Task moved to ${newStatus.replace('_', ' ')}`);
    } catch (err: any) {
      toastError(err.message || 'Failed to update task position');
    }
  };

  const openCreateForStatus = (status: TaskStatus) => {
    setDefaultColumnStatus(status);
    setIsCreateOpen(true);
  };

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
      success('Task created');
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
    if (window.confirm('Delete this task?')) {
      try {
        await deleteTaskMutation.mutateAsync(taskId);
        success('Task removed');
      } catch (err: any) {
        toastError(err.message || 'Failed to remove task');
      }
    }
  };

  return (
    <div>
      <Header
        title="Kanban Board"
        subtitle="Visualize workflow, drag cards to update progress"
        actions={
          <Button size="sm" onClick={() => openCreateForStatus('todo')}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Task
          </Button>
        }
      />

      <div className="p-6 sm:p-8 max-w-7xl mx-auto">
        {isError && (
          <ErrorState
            title="Failed to load Kanban board"
            message="Could not retrieve board tasks."
            onRetry={() => refetch()}
          />
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <LoadingSkeleton className="h-96" count={3} />
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              <KanbanColumn
                id="todo"
                title="To Do"
                tasks={todoTasks}
                count={todoTasks.length}
                onAddTask={openCreateForStatus}
                onEditTask={(t) => setEditingTask(t)}
                onDeleteTask={handleDelete}
              />

              <KanbanColumn
                id="in_progress"
                title="In Progress"
                tasks={inProgressTasks}
                count={inProgressTasks.length}
                onAddTask={openCreateForStatus}
                onEditTask={(t) => setEditingTask(t)}
                onDeleteTask={handleDelete}
              />

              <KanbanColumn
                id="done"
                title="Done"
                tasks={doneTasks}
                count={doneTasks.length}
                onAddTask={openCreateForStatus}
                onEditTask={(t) => setEditingTask(t)}
                onDeleteTask={handleDelete}
              />
            </div>
          </DragDropContext>
        )}
      </div>

      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Task"
        description="Add a card to your Kanban board"
      >
        <TaskForm
          initialValues={{ status: defaultColumnStatus }}
          onSubmit={handleCreate}
          onCancel={() => setIsCreateOpen(false)}
          isLoading={createTaskMutation.isPending}
        />
      </Dialog>

      <Dialog
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        title="Edit Task"
        description="Update task details or change column"
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
