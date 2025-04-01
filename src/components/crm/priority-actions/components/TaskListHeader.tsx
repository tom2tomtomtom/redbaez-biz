
import { RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TaskListHeaderProps {
  onRefresh: () => void;
}

export const TaskListHeader = ({ onRefresh }: TaskListHeaderProps) => {
  return (
    <div className="mb-4 flex justify-end">
      <Button onClick={onRefresh} variant="outline" size="sm">
        <RefreshCcw className="mr-2 h-4 w-4" />
        Refresh Tasks
      </Button>
    </div>
  );
};
