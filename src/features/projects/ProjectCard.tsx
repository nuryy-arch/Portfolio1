import React from 'react';
import { FolderKanban, Users, CheckCircle, MoreVertical, Trash2, Edit } from 'lucide-react';
import { Badge } from '../../components/Badge';
import type { Project } from '../../types';

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (projectId: string) => void;
  onClick?: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  onDelete,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 shadow-subtle hover:border-slate-300 hover:shadow-card transition-all cursor-pointer"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary shrink-0">
            <FolderKanban className="w-5 h-5" />
          </div>

          <div className="flex items-center gap-1.5">
            <Badge
              variant={project.role === 'owner' ? 'primary' : 'neutral'}
              size="sm"
            >
              {project.role || 'Member'}
            </Badge>

            {project.role === 'owner' && (
              <div
                className="flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                {onEdit && (
                  <button
                    onClick={() => onEdit(project)}
                    className="p-1 rounded text-text-secondary hover:text-text-primary hover:bg-slate-100"
                    title="Edit project"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(project.id)}
                    className="p-1 rounded text-text-secondary hover:text-danger hover:bg-danger-light"
                    title="Delete project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <h3 className="font-semibold text-base text-text-primary mb-1">
          {project.name}
        </h3>

        <p className="text-xs text-text-secondary line-clamp-2 mb-4 leading-relaxed">
          {project.description || 'No description provided for this project.'}
        </p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-text-secondary font-medium">
        <div className="flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-primary" />
          <span>{project.tasks_count || 0} tasks</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          <span>{project.members_count || 1} member</span>
        </div>
      </div>
    </div>
  );
};
