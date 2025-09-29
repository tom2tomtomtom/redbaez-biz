import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './button';
import { Alert, AlertDescription, AlertTitle } from './alert';
import { cn } from '@/lib/utils';

interface ErrorDisplayProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
  fullScreen?: boolean;
}

/**
 * A component for displaying errors with a retry option
 */
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title = 'An error occurred',
  message,
  onRetry,
  className,
  fullScreen = false,
}) => {
  const content = (
    <div className={cn('w-full max-w-md', className)}>
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
      
      {onRetry && (
        <Button 
          variant="outline" 
          onClick={onRetry}
          className="w-full"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm z-50">
        {content}
      </div>
    );
  }

  return content;
};

/**
 * A smaller inline error display
 */
export const InlineError: React.FC<{ message: string; className?: string }> = ({
  message,
  className,
}) => {
  return (
    <div className={cn('text-destructive text-sm flex items-center', className)}>
      <AlertCircle className="h-3 w-3 mr-1" />
      <span>{message}</span>
    </div>
  );
};

export default ErrorDisplay;
