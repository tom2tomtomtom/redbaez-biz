
import { AlertCircle, RefreshCw, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';

interface TaskListErrorStateProps {
  error: Error | unknown;
  onRefresh: () => void;
}

export const TaskListErrorState = ({ error, onRefresh }: TaskListErrorStateProps) => {
  const navigate = useNavigate();
  const errorMessage = error instanceof Error
    ? error.message
    : 'An unknown error occurred';

  const isAuthError = errorMessage.includes('Authentication required') ||
                     errorMessage.includes('Authentication check failed');

  if (isAuthError) {
    return (
      <Alert variant="destructive">
        <LogIn className="h-4 w-4" />
        <AlertTitle>Authentication Required</AlertTitle>
        <AlertDescription className="flex justify-between items-center">
          <span>Please log in to view your tasks</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/login')}
            className="bg-white hover:bg-gray-100"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Log In
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

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
