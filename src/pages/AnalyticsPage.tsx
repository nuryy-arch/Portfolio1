import React, { useState } from 'react';
import { 
  BarChart3, 
  CheckCircle2, 
  PieChart, 
  Clock, 
  AlertTriangle,
  FolderKanban,
  Calendar
} from 'lucide-react';
import { Header } from '../components/Header';
import { StatCard } from '../features/dashboard/StatCard';
import { Select } from '../components/Select';
import { useTasks } from '../features/tasks/useTasks';
import { useProjects } from '../features/projects/useProjects';

export const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7' | '30' | 'all'>('30');
  const { data: tasks = [] } = useTasks();
  const { data: projects = [] } = useProjects();

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'done').length;
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
  const todo = tasks.filter((t) => t.status === 'todo').length;

  const now = new Date();
  const overdue = tasks.filter(
    (t) => t.due_date && new Date(t.due_date) < now && t.status !== 'done'
  ).length;

  // Distribution by priority
  const priorityCounts = {
    urgent: tasks.filter((t) => t.priority === 'urgent').length,
    high: tasks.filter((t) => t.priority === 'high').length,
    medium: tasks.filter((t) => t.priority === 'medium').length,
    low: tasks.filter((t) => t.priority === 'low').length,
  };

  // Completion percentage
  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div>
      <Header
        title="Analytics"
        subtitle="Data-driven insights on task velocity, distribution and project health"
        actions={
          <div className="w-36">
            <Select
              options={[
                { label: 'Last 7 Days', value: '7' },
                { label: 'Last 30 Days', value: '30' },
                { label: 'All Time', value: 'all' },
              ]}
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
            />
          </div>
        }
      />

      <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
        {/* Top Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Created"
            value={total}
            icon={BarChart3}
            color="primary"
          />
          <StatCard
            label="Total Resolved"
            value={completed}
            change={`${completionPercentage}% completion`}
            isPositive={completionPercentage >= 50}
            icon={CheckCircle2}
            color="success"
          />
          <StatCard
            label="In Execution"
            value={inProgress}
            icon={Clock}
            color="warning"
          />
          <StatCard
            label="Overdue Backlog"
            value={overdue}
            icon={AlertTriangle}
            color={overdue > 0 ? 'danger' : 'success'}
          />
        </div>

        {/* Status & Priority Visual Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Breakdown */}
          <div className="bg-surface rounded-2xl border border-border p-6 shadow-subtle">
            <h3 className="font-bold text-sm text-text-primary mb-4 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-primary" />
              Tasks by Status
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-text-secondary">To Do</span>
                  <span className="text-text-primary">{todo} ({total > 0 ? Math.round((todo / total) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-slate-400 h-full rounded-full transition-all"
                    style={{ width: `${total > 0 ? (todo / total) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-text-secondary">In Progress</span>
                  <span className="text-primary font-bold">{inProgress} ({total > 0 ? Math.round((inProgress / total) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all"
                    style={{ width: `${total > 0 ? (inProgress / total) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-text-secondary">Done</span>
                  <span className="text-success-dark font-bold">{completed} ({total > 0 ? Math.round((completed / total) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-success h-full rounded-full transition-all"
                    style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Priority Breakdown */}
          <div className="bg-surface rounded-2xl border border-border p-6 shadow-subtle">
            <h3 className="font-bold text-sm text-text-primary mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              Tasks by Priority
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-danger font-medium">Urgent</span>
                  <span className="text-text-primary">{priorityCounts.urgent}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-danger h-full rounded-full transition-all"
                    style={{ width: `${total > 0 ? (priorityCounts.urgent / total) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-warning-dark font-medium">High</span>
                  <span className="text-text-primary">{priorityCounts.high}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-warning h-full rounded-full transition-all"
                    style={{ width: `${total > 0 ? (priorityCounts.high / total) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-primary font-medium">Medium</span>
                  <span className="text-text-primary">{priorityCounts.medium}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all"
                    style={{ width: `${total > 0 ? (priorityCounts.medium / total) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-text-secondary font-medium">Low</span>
                  <span className="text-text-primary">{priorityCounts.low}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-slate-400 h-full rounded-full transition-all"
                    style={{ width: `${total > 0 ? (priorityCounts.low / total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Health Table */}
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-subtle">
          <h3 className="font-bold text-sm text-text-primary mb-4 flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-primary" />
            Project Execution Health
          </h3>

          {projects.length === 0 ? (
            <p className="text-xs text-text-secondary text-center py-4">No active projects to analyze.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-text-secondary uppercase tracking-wider font-semibold">
                    <th className="pb-3">Project Name</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Total Tasks</th>
                    <th className="pb-3">Completion Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {projects.map((proj) => {
                    const projTasks = tasks.filter((t) => t.project_id === proj.id);
                    const doneProjTasks = projTasks.filter((t) => t.status === 'done');
                    const projPercent = projTasks.length > 0
                      ? Math.round((doneProjTasks.length / projTasks.length) * 100)
                      : 0;

                    return (
                      <tr key={proj.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 font-semibold text-text-primary">{proj.name}</td>
                        <td className="py-3 capitalize text-text-secondary">{proj.role}</td>
                        <td className="py-3 font-medium text-text-primary">{projTasks.length}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-32 bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-primary h-full rounded-full"
                                style={{ width: `${projPercent}%` }}
                              />
                            </div>
                            <span className="font-semibold text-text-primary">{projPercent}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
