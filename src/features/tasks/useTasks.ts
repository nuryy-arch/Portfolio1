import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../auth/AuthContext';
import type { Task, TaskStatus, Priority } from '../../types';

const LOCAL_STORAGE_TASKS_KEY = 'taskflow_demo_tasks';

const initialDemoTasks: Task[] = [
  {
    id: 'demo-task-1',
    project_id: 'demo-proj-1',
    created_by: 'demo-user-00000000-0000-0000-0000-000000000001',
    assignee_id: 'demo-user-00000000-0000-0000-0000-000000000001',
    title: 'Research user personas & pain points',
    description: 'Interview 5 enterprise customers regarding current project tracking workflows.',
    status: 'done',
    priority: 'high',
    due_date: new Date(Date.now() - 86400000 * 2).toISOString(),
    position: 0,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    completed_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    project: { id: 'demo-proj-1', name: 'Website Redesign' },
  },
  {
    id: 'demo-task-2',
    project_id: 'demo-proj-1',
    created_by: 'demo-user-00000000-0000-0000-0000-000000000001',
    assignee_id: 'demo-user-00000000-0000-0000-0000-000000000001',
    title: 'Design high-fidelity Tailwind components',
    description: 'Buttons, modals, cards, tabs, and accessible color tokens.',
    status: 'in_progress',
    priority: 'urgent',
    due_date: new Date(Date.now() + 86400000 * 2).toISOString(),
    position: 0,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date().toISOString(),
    completed_at: null,
    project: { id: 'demo-proj-1', name: 'Website Redesign' },
  },
  {
    id: 'demo-task-3',
    project_id: 'demo-proj-1',
    created_by: 'demo-user-00000000-0000-0000-0000-000000000001',
    assignee_id: null,
    title: 'Implement drag-and-drop Kanban state sync',
    description: 'Ensure smooth optimistic transitions and Supabase order persistence.',
    status: 'in_progress',
    priority: 'medium',
    due_date: new Date(Date.now() + 86400000 * 5).toISOString(),
    position: 1,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date().toISOString(),
    completed_at: null,
    project: { id: 'demo-proj-1', name: 'Website Redesign' },
  },
  {
    id: 'demo-task-4',
    project_id: 'demo-proj-2',
    created_by: 'demo-user-00000000-0000-0000-0000-000000000001',
    assignee_id: null,
    title: 'Setup automated Vitest suite',
    description: 'Unit tests for validation schemas, state transitions, and responsive layout.',
    status: 'todo',
    priority: 'high',
    due_date: new Date(Date.now() + 86400000 * 7).toISOString(),
    position: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completed_at: null,
    project: { id: 'demo-proj-2', name: 'Mobile App V2' },
  },
  {
    id: 'demo-task-5',
    project_id: null,
    created_by: 'demo-user-00000000-0000-0000-0000-000000000001',
    assignee_id: 'demo-user-00000000-0000-0000-0000-000000000001',
    title: 'Personal quarterly review & goal planning',
    description: 'Outline key milestones and technical metrics for Q3.',
    status: 'todo',
    priority: 'low',
    due_date: new Date(Date.now() + 86400000 * 10).toISOString(),
    position: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completed_at: null,
    project: null,
  },
];

function getStoredDemoTasks(): Task[] {
  const raw = localStorage.getItem(LOCAL_STORAGE_TASKS_KEY);
  if (!raw) {
    localStorage.setItem(LOCAL_STORAGE_TASKS_KEY, JSON.stringify(initialDemoTasks));
    return initialDemoTasks;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return initialDemoTasks;
  }
}

export interface TaskFiltersState {
  status?: TaskStatus | 'all';
  priority?: Priority | 'all';
  projectId?: string | 'all';
  search?: string;
  sortBy?: 'created_at' | 'due_date' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

export const useTasks = (filters?: TaskFiltersState) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['tasks', user?.id, filters],
    queryFn: async () => {
      if (!isSupabaseConfigured) {
        let tasks = getStoredDemoTasks();

        if (filters?.search) {
          const q = filters.search.toLowerCase();
          tasks = tasks.filter(
            (t) => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
          );
        }
        if (filters?.status && filters.status !== 'all') {
          tasks = tasks.filter((t) => t.status === filters.status);
        }
        if (filters?.priority && filters.priority !== 'all') {
          tasks = tasks.filter((t) => t.priority === filters.priority);
        }
        if (filters?.projectId && filters.projectId !== 'all') {
          tasks = tasks.filter((t) => t.project_id === filters.projectId);
        }

        // Sorting
        const order = filters?.sortOrder === 'asc' ? 1 : -1;
        tasks.sort((a, b) => {
          if (filters?.sortBy === 'due_date') {
            const dateA = a.due_date ? new Date(a.due_date).getTime() : 9999999999999;
            const dateB = b.due_date ? new Date(b.due_date).getTime() : 9999999999999;
            return (dateA - dateB) * order;
          }
          if (filters?.sortBy === 'priority') {
            const weight = { urgent: 4, high: 3, medium: 2, low: 1 };
            return (weight[a.priority] - weight[b.priority]) * order;
          }
          // Default created_at
          return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * order;
        });

        return tasks;
      }

      // Supabase query with relational joins
      let query = supabase
        .from('tasks')
        .select(`
          *,
          project:projects(id, name),
          assignee:profiles!tasks_assignee_id_fkey(id, display_name, avatar_url),
          creator:profiles!tasks_created_by_fkey(id, display_name, avatar_url)
        `);

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.priority && filters.priority !== 'all') {
        query = query.eq('priority', filters.priority);
      }
      if (filters?.projectId && filters.projectId !== 'all') {
        query = query.eq('project_id', filters.projectId);
      }
      if (filters?.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }

      const sortBy = filters?.sortBy || 'position';
      const ascending = filters?.sortOrder === 'asc' || sortBy === 'position';
      query = query.order(sortBy, { ascending });

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Task[];
    },
    enabled: !!user,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (newTask: {
      title: string;
      description?: string;
      status?: TaskStatus;
      priority?: Priority;
      due_date?: string | null;
      project_id?: string | null;
      assignee_id?: string | null;
    }) => {
      if (!isSupabaseConfigured) {
        const list = getStoredDemoTasks();
        const task: Task = {
          id: `demo-task-${Date.now()}`,
          created_by: user?.id || 'demo-user',
          title: newTask.title,
          description: newTask.description || null,
          status: newTask.status || 'todo',
          priority: newTask.priority || 'medium',
          due_date: newTask.due_date || null,
          project_id: newTask.project_id || null,
          assignee_id: newTask.assignee_id || null,
          position: list.length,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          completed_at: newTask.status === 'done' ? new Date().toISOString() : null,
          project: newTask.project_id ? { id: newTask.project_id, name: 'Project' } : null,
        };
        const updated = [task, ...list];
        localStorage.setItem(LOCAL_STORAGE_TASKS_KEY, JSON.stringify(updated));
        return task;
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          created_by: user?.id,
          title: newTask.title,
          description: newTask.description || null,
          status: newTask.status || 'todo',
          priority: newTask.priority || 'medium',
          due_date: newTask.due_date || null,
          project_id: newTask.project_id || null,
          assignee_id: newTask.assignee_id || null,
        })
        .select(`
          *,
          project:projects(id, name)
        `)
        .single();

      if (error) throw error;
      return data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<Task> & { id: string }) => {
      if (!isSupabaseConfigured) {
        const list = getStoredDemoTasks();
        const updated = list.map((t) => {
          if (t.id === id) {
            const completedAt =
              updates.status === 'done'
                ? t.completed_at || new Date().toISOString()
                : updates.status
                ? null
                : t.completed_at;

            return {
              ...t,
              ...updates,
              completed_at: completedAt,
              updated_at: new Date().toISOString(),
            };
          }
          return t;
        });
        localStorage.setItem(LOCAL_STORAGE_TASKS_KEY, JSON.stringify(updated));
        return updated.find((t) => t.id === id);
      }

      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          project:projects(id, name)
        `)
        .single();

      if (error) throw error;
      return data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!isSupabaseConfigured) {
        const list = getStoredDemoTasks();
        const filtered = list.filter((t) => t.id !== id);
        localStorage.setItem(LOCAL_STORAGE_TASKS_KEY, JSON.stringify(filtered));
        return true;
      }

      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};
