import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  Plus, 
  ArrowRight,
  FolderKanban
} from 'lucide-react';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Dialog } from '../components/Dialog';
import { StatCard } from '../features/dashboard/StatCard';
import { TaskCard } from '../features/tasks/TaskCard';
import { TaskForm, TaskFormData } from '../features/tasks/TaskForm';
import { useAuth } from '../features/auth/AuthContext';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../features/tasks/useTasks';
import { useProjects } from '../features/projects/useProjects';
import { useToast } from '../components/Toast';

export const DashboardPage: React.FC = () => {
  const { profile } = useAuth();
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);

  const { data: tasks = [] } = useTasks();
  const { data: projects = [] } = useProjects();
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const { success, error: toastError } = useToast();

  const totalTasks = tasks.length;
  const todoTasks = tasks.filter((t) => t.status === 'todo').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  
  const now = new Date();
  const overdueTasks = tasks.filter(
    (t) => t.due_date && new Date(t.due_date) < now && t.status !== 'done'
  ).length;

  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Recent tasks (top 4)
  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4);

  // Upcoming deadlines (tasks with due dates that are not done)
  const upcomingDeadlines = tasks
    .filter((t) => t.due_date && t.status !== 'done')
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
    .slice(0, 3);

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
      setIsQuickCreateOpen(false);
    } catch (err: any) {
      toastError(err.message || 'Failed to create task');
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: any) => {
    try {
      await updateTaskMutation.mutateAsync({ id: taskId, status: newStatus });
      success('Status updated');
    } catch (err: any) {
      toastError(err.message || 'Error updating status');
    }
  };

  const handleDelete = async (taskId: string) => {
    if (window.confirm('Delete this task?')) {
      try {
        await deleteTaskMutation.mutateAsync(taskId);
        success('Task removed');
      } catch (err: any) {
        toastError(err.message || 'Error deleting task');
      }
    }
  };

  return (
    <div>
      <Header
        title={`Hello, ${profile?.display_name?.split(' ')[0] || 'there'} 👋`}
        subtitle="Here is what is happening with your tasks and projects today."
        actions={
          <Button size="sm" onClick={() => setIsQuickCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Quick Task
          </Button>
        }
      />

      <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            label="Total Tasks"
            value={totalTasks}
            icon={CheckSquare}
            color="primary"
          />
          <StatCard
            label="To Do"
            value={todoTasks}
            icon={Clock}
            color="warning"
          />
          <StatCard
            label="In Progress"
            value={inProgressTasks}
            icon={TrendingUp}
            color="primary"
          />
          <StatCard
            label="Completed"
            value={doneTasks}
            change={`${completionRate}% done`}
            isPositive={completionRate > 50}
            icon={CheckCircle2}
            color="success"
          />
          <StatCard
            label="Overdue"
            value={overdueTasks}
            icon={AlertCircle}
            color={overdueTasks > 0 ? 'danger' : 'success'}
          />
        </div>

        {/* Weekly Progress Banner */}
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-subtle flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-base font-bold text-text-primary">
              Project Completion Velocity
            </h3>
            <p className="text-xs text-text-secondary">
              You have completed {doneTasks} of {totalTasks} assigned tasks. Keep up the momentum!
            </p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-72">
            <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-500 rounded-full"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <span className="text-sm font-bold text-primary min-w-[40px]">
              {completionRate}%
            </span>
          </div>
        </div>

        {/* 2-Column: Recent Tasks & Right Sidebar (Deadlines + Projects) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Tasks */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-text-primary">Recent Tasks</h3>
              <Link
                to="/tasks"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                View all tasks <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentTasks.length === 0 ? (
              <div className="bg-surface rounded-2xl border border-dashed border-border p-8 text-center text-xs text-text-secondary">
                No tasks created yet. Click "Quick Task" above to add one.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recentTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Rail: Upcoming Deadlines & Projects */}
          <div className="space-y-6">
            {/* Upcoming Deadlines */}
            <div className="bg-surface rounded-2xl border border-border p-5 shadow-subtle">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
                <h4 className="font-bold text-sm text-text-primary flex items-center gap-2">
                  <Clock className="w-4 h-4 text-warning" />
                  Upcoming Deadlines
                </h4>
              </div>

              {upcomingDeadlines.length === 0 ? (
                <p className="text-xs text-text-secondary py-2 text-center">
                  No impending deadlines this week.
                </p>
              ) : (
                <div className="space-y-3">
                  {upcomingDeadlines.map((task) => (
                    <div
                      key={task.id}
                      className="p-2.5 rounded-xl border border-border/70 hover:bg-slate-50 transition-colors flex items-center justify-between"
                    >
                      <div className="truncate pr-2">
                        <p className="text-xs font-semibold text-text-primary truncate">
                          {task.title}
                        </p>
                        <p className="text-[11px] text-text-secondary truncate">
                          {task.project?.name || 'Personal'}
                        </p>
                      </div>
                      <span className="text-[11px] font-semibold text-warning-dark bg-warning-light px-2 py-0.5 rounded-full whitespace-nowrap">
                        {new Date(task.due_date!).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Active Projects */}
            <div className="bg-surface rounded-2xl border border-border p-5 shadow-subtle">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
                <h4 className="font-bold text-sm text-text-primary flex items-center gap-2">
                  <FolderKanban className="w-4 h-4 text-primary" />
                  Active Projects
                </h4>
                <Link
                  to="/projects"
                  className="text-xs text-primary hover:underline font-semibold"
                >
                  All
                </Link>
              </div>

              {projects.length === 0 ? (
                <p className="text-xs text-text-secondary py-2 text-center">
                  No active projects yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {projects.slice(0, 3).map((proj) => (
                    <div
                      key={proj.id}
                      className="p-2.5 rounded-xl border border-border/70 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <div className="truncate">
                        <p className="text-xs font-semibold text-text-primary truncate">
                          {proj.name}
                        </p>
                        <p className="text-[11px] text-text-secondary">
                          {proj.tasks_count || 0} tasks
                        </p>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-primary bg-primary-light px-2 py-0.5 rounded-full">
                        {proj.role}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Task Modal */}
      <Dialog
        isOpen={isQuickCreateOpen}
        onClose={() => setIsQuickCreateOpen(false)}
        title="Quick Task"
        description="Fast capture a new task into your workspace"
      >
        <TaskForm
          onSubmit={handleCreate}
          onCancel={() => setIsQuickCreateOpen(false)}
          isLoading={createTaskMutation.isPending}
        />
      </Dialog>
    </div>
  );
};
