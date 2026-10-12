import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';
import type { Task, TaskStatus } from '../../types';

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  count: number;
  onAddTask?: (status: TaskStatus) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  id,
  title,
  tasks,
  count,
  onAddTask,
  onEditTask,
  onDeleteTask,
}) => {
  const columnColorIndicator = {
    todo: 'bg-slate-400',
    in_progress: 'bg-primary',
    done: 'bg-success',
  }[id];

  return (
    <div className="flex flex-col bg-slate-50/70 rounded-2xl border border-border p-4 h-full min-h-[500px]">
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${columnColorIndicator}`} />
          <h3 className="font-semibold text-sm text-text-primary">{title}</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-surface border border-border font-medium text-text-secondary">
            {count}
          </span>
        </div>

        {onAddTask && (
          <button
            onClick={() => onAddTask(id)}
            className="p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface border border-transparent hover:border-border transition-colors"
            title={`Add task to ${title}`}
            aria-label={`Add task to ${title}`}
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Droppable Card Area */}
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 space-y-3 transition-colors rounded-xl p-1 ${
              snapshot.isDraggingOver ? 'bg-primary-light/30' : ''
            }`}
          >
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="focus:outline-none"
                  >
                    <TaskCard
                      task={task}
                      isDragging={snapshot.isDragging}
                      onEdit={onEditTask}
                      onDelete={onDeleteTask}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="py-8 text-center text-xs text-text-secondary/70 border border-dashed border-border/80 rounded-xl">
                No tasks in this column
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};
