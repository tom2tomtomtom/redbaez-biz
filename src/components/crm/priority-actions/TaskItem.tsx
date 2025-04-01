
import { useState } from 'react';
import { format } from 'date-fns';
import { Check, Calendar, Trash2, AlertCircle } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/types/task';
import logger from '@/utils/logger';

interface TaskItemProps {
  task: Task;
  onUpdateCompletion: (completed: boolean) => void;
  onUpdateUrgency: (urgent: boolean) => void;
  onDelete: () => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
  onSelect?: () => void;
}

export const TaskItem = ({
  task,
  onUpdateCompletion,
  onUpdateUrgency,
  onDelete,
  isUpdating = false,
  isDeleting = false,
  onSelect,
}: TaskItemProps) => {
  // Debug output for task data
  logger.info(`Rendering TaskItem for task ${task.id}`, { 
    title: task.title,
    status: task.status,
    urgent: task.urgent
  });

  const [isHovered, setIsHovered] = useState(false);
  
  // Format due date
  const formattedDueDate = task.due_date 
    ? format(new Date(task.due_date), 'MMM d, yyyy') 
    : 'No due date';

  const clientName = task.client_name || 
    (task.client ? task.client.name : null);

  return (
    <div
      className={`p-4 border rounded-lg transition-all ${
        isHovered ? 'shadow-md' : 'shadow-sm'
      } ${task.urgent ? 'border-red-200 bg-red-50/50' : 'border-gray-200'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
    >
      <div className="flex justify-between">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            {task.urgent && (
              <AlertCircle size={16} className="text-red-500" />
            )}
            <h4 className="font-medium">{task.title}</h4>
          </div>
          
          {task.description && (
            <p className="text-sm text-gray-600">{task.description}</p>
          )}
          
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar size={14} />
            <span>{formattedDueDate}</span>
            
            {task.category && (
              <Badge variant="outline" className="ml-2">
                {task.category}
              </Badge>
            )}
          </div>

          {clientName && (
            <div className="flex items-center mt-2">
              <Avatar className="h-5 w-5 mr-1">
                <AvatarFallback className="text-xs">
                  {clientName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-gray-600">{clientName}</span>
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          <button
            className={`p-1.5 rounded-full transition-colors ${
              task.status === 'completed'
                ? 'bg-green-100 text-green-600 hover:bg-green-200'
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onUpdateCompletion(task.status !== 'completed');
            }}
            disabled={isUpdating}
            aria-label={task.status === 'completed' ? 'Mark as incomplete' : 'Mark as complete'}
          >
            <Check size={16} />
          </button>
          
          <button
            className={`p-1.5 rounded-full transition-colors ${
              isDeleting
                ? 'bg-gray-100 text-gray-400'
                : 'bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            disabled={isDeleting}
            aria-label="Delete task"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
