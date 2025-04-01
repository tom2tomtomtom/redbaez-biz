
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TaskListHeaderProps {
  onRefresh: () => void;
  tasksCount: number;
  isLoading?: boolean;
  hasError?: boolean;
}

export const TaskListHeader = ({ 
  onRefresh, 
  tasksCount,
  isLoading = false,
  hasError = false
}: TaskListHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <h3 className="text-sm font-medium text-gray-500">
          {isLoading 
            ? 'Loading tasks...' 
            : hasError 
              ? 'Error loading tasks' 
              : `${tasksCount} tasks found`
          }
        </h3>
      </div>
      <Button 
        onClick={onRefresh} 
        variant="outline" 
        size="sm" 
        disabled={isLoading}
      >
        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        {isLoading ? 'Refreshing...' : 'Refresh'}
      </Button>
    </div>
  );
};
