
import { RefreshCw, Inbox, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TaskListEmptyStateProps {
  showCompleted: boolean;
  category?: string;
  onRefresh: () => void;
  onCreateNew?: () => void;
}

export const TaskListEmptyState = ({
  showCompleted,
  category,
  onRefresh,
  onCreateNew
}: TaskListEmptyStateProps) => {
  const getMessage = () => {
    if (showCompleted) {
      return `No completed tasks found${category && category !== 'All' ? ` in ${category}` : ''}`;
    }
    
    return `No active tasks found${category && category !== 'All' ? ` in ${category}` : ''}`;
  };

  return (
    <div className="py-10 text-center border rounded-lg bg-gray-50">
      <Inbox className="h-12 w-12 mx-auto text-gray-400" />
      <h3 className="mt-4 text-lg font-medium text-gray-900">{getMessage()}</h3>
      <p className="mt-1 text-sm text-gray-500">
        {showCompleted 
          ? "Tasks marked as complete will appear here"
          : "Create a new task to get started"
        }
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Button
          variant="outline"
          onClick={onRefresh}
          className="px-3 py-2 text-sm"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
        
        {!showCompleted && onCreateNew && (
          <Button
            onClick={onCreateNew}
            className="px-3 py-2 text-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Task
          </Button>
        )}
      </div>
    </div>
  );
};
