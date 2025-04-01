
import { RefreshCcw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TaskListErrorStateProps {
  error: Error;
  onRefresh: () => void;
}

export const TaskListErrorState = ({ error, onRefresh }: TaskListErrorStateProps) => {
  return (
    <div className="p-4 text-center">
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4 mr-2" />
        <AlertDescription>
          Error loading tasks: {error.message || "Unknown error"}
        </AlertDescription>
      </Alert>
      <Button onClick={onRefresh} variant="outline" size="sm">
        <RefreshCcw className="mr-2 h-4 w-4" />
        Try Again
      </Button>
    </div>
  );
};
