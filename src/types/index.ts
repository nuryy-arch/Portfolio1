export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'todo' | 'in_progress' | 'done';

export type ProjectRole = 'owner' | 'member';

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  // Computed / joined fields
  role?: ProjectRole;
  members_count?: number;
  tasks_count?: number;
}

export interface ProjectMember {
  project_id: string;
  user_id: string;
  role: ProjectRole;
  created_at: string;
  profile?: Profile;
}

export interface Task {
  id: string;
  project_id: string | null;
  created_by: string;
  assignee_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  due_date: string | null;
  position: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  // Joined fields
  project?: {
    id: string;
    name: string;
  } | null;
  assignee?: Profile | null;
  creator?: Profile | null;
}
