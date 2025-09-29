import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'accent' | 'white';
  className?: string;
  message?: string;
  fullScreen?: boolean;
}

/**
 * A customizable loading spinner component
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className,
  message,
  fullScreen = false,
}) => {
  // Size mappings
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  // Color mappings
  const colorClasses = {
    primary: 'border-primary border-t-transparent',
    secondary: 'border-secondary border-t-transparent',
    accent: 'border-accent border-t-transparent',
    white: 'border-white border-t-transparent',
  };

  const spinnerClasses = cn(
    'animate-spin rounded-full',
    sizeClasses[size],
    colorClasses[color],
    className
  );

  const content = (
    <div className="flex flex-col items-center justify-center">
      <div className={spinnerClasses} />
      {message && (
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        {content}
      </div>
    );
  }

  return content;
};

/**
 * A loading overlay that covers its parent container
 */
export const LoadingOverlay: React.FC<LoadingSpinnerProps> = (props) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
      <LoadingSpinner {...props} />
    </div>
  );
};

export default LoadingSpinner;
