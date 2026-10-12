import React from 'react';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { useProjects } from '../projects/useProjects';
import type { TaskFiltersState } from './useTasks';

interface TaskFiltersProps {
  filters: TaskFiltersState;
  onChange: (filters: TaskFiltersState) => void;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({ filters, onChange }) => {
  const { data: projects = [] } = useProjects();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, search: e.target.value });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, status: e.target.value as any });
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, priority: e.target.value as any });
  };

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, projectId: e.target.value });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, sortBy: e.target.value as any });
  };

  return (
    <div className="bg-surface p-4 rounded-xl border border-border shadow-subtle mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search */}
        <div className="lg:col-span-1">
          <Input
            placeholder="Search tasks..."
            leftIcon={<Search className="w-4 h-4 text-text-secondary" />}
            value={filters.search || ''}
            onChange={handleSearchChange}
          />
        </div>

        {/* Status Filter */}
        <div>
          <Select
            options={[
              { label: 'All Statuses', value: 'all' },
              { label: 'To Do', value: 'todo' },
              { label: 'In Progress', value: 'in_progress' },
              { label: 'Done', value: 'done' },
            ]}
            value={filters.status || 'all'}
            onChange={handleStatusChange}
          />
        </div>

        {/* Priority Filter */}
        <div>
          <Select
            options={[
              { label: 'All Priorities', value: 'all' },
              { label: 'Urgent', value: 'urgent' },
              { label: 'High', value: 'high' },
              { label: 'Medium', value: 'medium' },
              { label: 'Low', value: 'low' },
            ]}
            value={filters.priority || 'all'}
            onChange={handlePriorityChange}
          />
        </div>

        {/* Project Filter */}
        <div>
          <Select
            options={[
              { label: 'All Projects', value: 'all' },
              ...projects.map((p) => ({ label: p.name, value: p.id })),
            ]}
            value={filters.projectId || 'all'}
            onChange={handleProjectChange}
          />
        </div>

        {/* Sort */}
        <div>
          <Select
            options={[
              { label: 'Sort: Date Created', value: 'created_at' },
              { label: 'Sort: Due Date', value: 'due_date' },
              { label: 'Sort: Priority', value: 'priority' },
            ]}
            value={filters.sortBy || 'created_at'}
            onChange={handleSortChange}
          />
        </div>
      </div>
    </div>
  );
};
