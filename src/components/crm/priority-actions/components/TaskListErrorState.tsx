
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface TaskListErrorStateProps {
  error: Error | unknown;
  onRefresh: () => void;
}

export const TaskListErrorState = ({ error, onRefresh }: TaskListErrorStateProps) => {
  const errorMessage = error instanceof Error 
    ? error.message 
    : 'An unknown error occurred';

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error loading tasks</AlertTitle>
      <AlertDescription className="flex justify-between items-center">
        <span>{errorMessage}</span>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={onRefresh}
          className="bg-white hover:bg-gray-100"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </AlertDescription>
    </Alert>
  );
};
