import React, { useState } from 'react';
import { format } from 'date-fns';
import { Check, Calendar, Trash2, AlertCircle, Clock, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Task, TaskPriority } from '@/types/task';
import logger from '@/utils/logger';

interface UnifiedTaskItemProps {
  task: Task;
  onUpdateCompletion: (completed: boolean) => void;
  onUpdatePriority: (priority: TaskPriority) => void;
  onDelete: () => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
  onSelect?: () => void;
}

export const UnifiedTaskItem: React.FC<UnifiedTaskItemProps> = ({
  task,
  onUpdateCompletion,
  onUpdatePriority,
  onDelete,
  isUpdating = false,
  isDeleting = false,
  onSelect,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  logger.info(`Rendering UnifiedTaskItem for task ${task.id}`, {
    title: task.title,
    status: task.status,
    priority: task.priority
  });

  // Format due date
  const formattedDueDate = task.due_date
    ? format(new Date(task.due_date), 'MMM d, yyyy')
    : 'No due date';

  // Get priority styling
  const getPriorityStyle = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return 'border-red-500 bg-red-50/50 shadow-red-100';
      case 'high':
        return 'border-orange-300 bg-orange-50/50 shadow-orange-100';
      case 'normal':
        return 'border-gray-200 bg-white';
      case 'low':
        return 'border-green-200 bg-green-50/50 shadow-green-100';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  // Get priority badge color
  const getPriorityBadgeColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'normal':
        return 'bg-blue-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // Get priority icon
  const getPriorityIcon = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle size={16} className="text-red-500" />;
      case 'high':
        return <Clock size={16} className="text-orange-500" />;
      default:
        return null;
    }
  };

  const isCompleted = task.status === 'completed';

  return (
    <div
      className={`p-4 border rounded-lg transition-all cursor-pointer ${
        isHovered ? 'shadow-md' : 'shadow-sm'
      } ${getPriorityStyle(task.priority)} ${
        isCompleted ? 'opacity-60' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          {/* Title and Priority */}
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isCompleted}
              onCheckedChange={onUpdateCompletion}
              disabled={isUpdating}
            />

            {getPriorityIcon(task.priority)}

            <h4 className={`font-medium flex-1 ${isCompleted ? 'line-through text-gray-500' : ''}`}>
              {task.title}
            </h4>

            <Badge className={`text-xs ${getPriorityBadgeColor(task.priority)}`}>
              {task.priority.toUpperCase()}
            </Badge>
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-sm text-gray-600 ml-6">{task.description}</p>
          )}

          {/* Meta information */}
          <div className="flex items-center gap-4 ml-6 text-xs text-gray-500">
            {/* Due Date */}
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{formattedDueDate}</span>
            </div>

            {/* Client */}
            {task.client_name && (
              <div className="flex items-center gap-1">
                <User size={14} />
                <span>{task.client_name}</span>
              </div>
            )}

            {/* Category */}
            {task.category && (
              <Badge variant="outline" className="text-xs">
                {task.category}
              </Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-4">
          {/* Priority Quick Change */}
          <div className="flex gap-1">
            {(['low', 'normal', 'high', 'urgent'] as TaskPriority[]).map((priority) => (
              <Button
                key={priority}
                size="sm"
                variant={task.priority === priority ? "default" : "ghost"}
                className="h-6 w-6 p-0 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdatePriority(priority);
                }}
                title={`Set ${priority} priority`}
              >
                {priority === 'urgent' ? '🔴' :
                 priority === 'high' ? '🟠' :
                 priority === 'normal' ? '🔵' : '🟢'}
              </Button>
            ))}
          </div>

          {/* Delete */}
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            disabled={isDeleting}
            className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
            title="Delete task"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
};