
import { RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TaskListEmptyStateProps {
  showCompleted: boolean;
  category?: string;
  onRefresh: () => void;
}

export const TaskListEmptyState = ({ 
  showCompleted, 
  category, 
  onRefresh 
}: TaskListEmptyStateProps) => {
  return (
    <div className="p-4 text-center text-gray-500">
      <p className="mb-2">
        No {showCompleted ? "completed" : "active"} tasks found{category && category !== 'All' ? ` for category: ${category}` : ''}.
      </p>
      <Button onClick={onRefresh} variant="outline" size="sm">
        <RefreshCcw className="mr-2 h-4 w-4" />
        Refresh
      </Button>
    </div>
  );
};
