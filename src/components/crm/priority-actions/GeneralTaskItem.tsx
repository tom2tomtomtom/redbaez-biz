import { Link } from 'react-router-dom';
import { Calendar, AlertTriangle } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

interface GeneralTaskItemProps {
  task: Tables<'general_tasks'>;
}

export const GeneralTaskItem = ({ task }: GeneralTaskItemProps) => {
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'marketing':
        return 'bg-purple-50 border-purple-100 text-purple-600';
      case 'product development':
        return 'bg-blue-50 border-blue-100 text-blue-600';
      case 'partnerships':
        return 'bg-green-50 border-green-100 text-green-600';
      default:
        return 'bg-gray-50 border-gray-100 text-gray-600';
    }
  };

  return (
    <div className={`p-3 ${getCategoryColor(task.category)} rounded-lg border ${task.urgent ? 'ring-2 ring-red-500' : ''}`}>
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-2">
          {task.urgent && (
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <span className="font-medium">{task.title}</span>
            <p className="text-sm text-gray-600 mt-1">
              {task.description || 'No description provided'}
            </p>
          </div>
        </div>
        <span className="text-sm px-2 py-1 rounded-full bg-opacity-50">
          {task.category}
        </span>
      </div>
      <div className="mt-2 text-sm flex items-center gap-2">
        <Calendar size={14} />
        Due: {task.next_due_date 
          ? new Date(task.next_due_date).toLocaleDateString()
          : 'No deadline set'}
      </div>
    </div>
  );
};