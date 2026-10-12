import React, { useState } from 'react';
import { Plus, FolderKanban } from 'lucide-react';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Dialog } from '../components/Dialog';
import { Input } from '../components/Input';
import { EmptyState } from '../components/EmptyState';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ErrorState } from '../components/ErrorState';
import { useToast } from '../components/Toast';
import { ProjectCard } from '../features/projects/ProjectCard';
import {
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
} from '../features/projects/useProjects';
import type { Project } from '../types';

export const ProjectsPage: React.FC = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const { data: projects = [], isLoading, isError, refetch } = useProjects();
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();
  const deleteMutation = useDeleteProject();
  const { success, error: toastError } = useToast();

  const handleOpenCreate = () => {
    setName('');
    setDescription('');
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (p: Project) => {
    setEditingProject(p);
    setName(p.name);
    setDescription(p.description || '');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      if (editingProject) {
        await updateMutation.mutateAsync({
          id: editingProject.id,
          name: name.trim(),
          description: description.trim() || undefined,
        });
        success('Project updated');
        setEditingProject(null);
      } else {
        await createMutation.mutateAsync({
          name: name.trim(),
          description: description.trim() || undefined,
        });
        success('Project created');
        setIsCreateOpen(false);
      }
    } catch (err: any) {
      toastError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project? All associated tasks will also be removed.')) {
      try {
        await deleteMutation.mutateAsync(projectId);
        success('Project deleted');
      } catch (err: any) {
        toastError(err.message || 'Failed to delete project');
      }
    }
  };

  return (
    <div>
      <Header
        title="Projects"
        subtitle="Manage spaces, collaborative teams and initiatives"
        actions={
          <Button size="sm" onClick={handleOpenCreate}>
            <Plus className="w-4 h-4 mr-1.5" />
            New Project
          </Button>
        }
      />

      <div className="p-6 sm:p-8 max-w-7xl mx-auto">
        {isError && (
          <ErrorState
            title="Failed to load projects"
            message="Could not retrieve your projects from the server."
            onRetry={() => refetch()}
          />
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <LoadingSkeleton className="h-44" count={6} />
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No projects found"
            description="Create your first project to start grouping and delegating tasks."
            actionLabel="Create Project"
            onAction={handleOpenCreate}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal Dialog for Create & Edit */}
      <Dialog
        isOpen={isCreateOpen || !!editingProject}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingProject(null);
        }}
        title={editingProject ? 'Edit Project' : 'Create Project'}
        description="Projects help you organize related tasks and team members"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Project Name"
            placeholder="e.g. Mobile App Redesign"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="What is this project about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/60 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border mt-6">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsCreateOpen(false);
                setEditingProject(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingProject ? 'Save Changes' : 'Create Project'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
