import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../auth/AuthContext';
import type { Project, ProjectMember, ProjectRole } from '../../types';

const LOCAL_STORAGE_PROJECTS_KEY = 'taskflow_demo_projects';
const LOCAL_STORAGE_MEMBERS_KEY = 'taskflow_demo_members';

const initialDemoProjects: Project[] = [
  {
    id: 'demo-proj-1',
    name: 'Website Redesign',
    description: 'Complete overhaul of marketing pages and responsive design system',
    owner_id: 'demo-user-00000000-0000-0000-0000-000000000001',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    archived_at: null,
    role: 'owner',
    tasks_count: 5,
    members_count: 2,
  },
  {
    id: 'demo-proj-2',
    name: 'Mobile App V2',
    description: 'React Native integration, push notifications, and offline sync',
    owner_id: 'demo-user-00000000-0000-0000-0000-000000000001',
    created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
    updated_at: new Date().toISOString(),
    archived_at: null,
    role: 'owner',
    tasks_count: 3,
    members_count: 1,
  },
];

function getStoredDemoProjects(): Project[] {
  const raw = localStorage.getItem(LOCAL_STORAGE_PROJECTS_KEY);
  if (!raw) {
    localStorage.setItem(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(initialDemoProjects));
    return initialDemoProjects;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return initialDemoProjects;
  }
}

export const useProjects = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      if (!isSupabaseConfigured) {
        return getStoredDemoProjects();
      }

      // Supabase query with membership check
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_members (role, user_id),
          tasks (id)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((p: any) => {
        const userMembership = p.project_members?.find((m: any) => m.user_id === user?.id);
        const role: ProjectRole = p.owner_id === user?.id ? 'owner' : (userMembership?.role || 'member');
        return {
          id: p.id,
          name: p.name,
          description: p.description,
          owner_id: p.owner_id,
          created_at: p.created_at,
          updated_at: p.updated_at,
          archived_at: p.archived_at,
          role,
          members_count: p.project_members?.length || 1,
          tasks_count: p.tasks?.length || 0,
        } as Project;
      });
    },
    enabled: !!user,
  });
};

export const useProject = (projectId?: string) => {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      if (!isSupabaseConfigured) {
        const list = getStoredDemoProjects();
        return list.find((p) => p.id === projectId) || null;
      }

      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_members (
            role,
            user_id,
            profiles (id, display_name, avatar_url)
          )
        `)
        .eq('id', projectId)
        .single();

      if (error) throw error;
      return data as Project & { project_members: ProjectMember[] };
    },
    enabled: !!projectId,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      if (!isSupabaseConfigured) {
        const list = getStoredDemoProjects();
        const newProj: Project = {
          id: `demo-proj-${Date.now()}`,
          name,
          description: description || null,
          owner_id: user?.id || 'demo-user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          archived_at: null,
          role: 'owner',
          members_count: 1,
          tasks_count: 0,
        };
        const updated = [newProj, ...list];
        localStorage.setItem(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(updated));
        return newProj;
      }

      const { data, error } = await supabase
        .from('projects')
        .insert({
          name,
          description: description || null,
          owner_id: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name, description }: { id: string; name: string; description?: string }) => {
      if (!isSupabaseConfigured) {
        const list = getStoredDemoProjects();
        const updated = list.map((p) =>
          p.id === id ? { ...p, name, description: description || null, updated_at: new Date().toISOString() } : p
        );
        localStorage.setItem(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(updated));
        return updated.find((p) => p.id === id);
      }

      const { data, error } = await supabase
        .from('projects')
        .update({
          name,
          description: description || null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.id] });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!isSupabaseConfigured) {
        const list = getStoredDemoProjects();
        const filtered = list.filter((p) => p.id !== id);
        localStorage.setItem(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(filtered));
        return true;
      }

      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};
