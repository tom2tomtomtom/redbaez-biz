
import { RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TaskListHeaderProps {
  onRefresh: () => void;
  tasksCount?: number;
}

export const TaskListHeader = ({ onRefresh, tasksCount }: TaskListHeaderProps) => {
  return (
    <div className="mb-4 flex items-center justify-between">
      {tasksCount !== undefined && (
        <div className="text-sm text-gray-600">
          {tasksCount} task{tasksCount !== 1 ? 's' : ''}
        </div>
      )}
      <Button onClick={onRefresh} variant="outline" size="sm" className="ml-auto">
        <RefreshCcw className="mr-2 h-4 w-4" />
        Refresh Tasks
      </Button>
    </div>
  );
};
