
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

type LoadingVariant = 'spinner' | 'skeleton' | 'text';

interface LoadingStateProps {
  variant?: LoadingVariant;
  text?: string;
  height?: string | number;
  width?: string | number;
  count?: number;
  className?: string;
  isLoading?: boolean;
  children?: React.ReactNode;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  variant = 'skeleton',
  text = 'Loading...',
  height = '24px',
  width = '100%',
  count = 1,
  className = '',
  isLoading = true,
  children,
}) => {
  // If not loading, render children if provided
  if (!isLoading) {
    return <>{children}</>;
  }

  // Helper function to render multiple skeletons
  const renderSkeletons = () => {
    return Array.from({ length: count }).map((_, i) => (
      <Skeleton
        key={i}
        style={{ height, width }}
        className={`mb-2 ${className}`}
      />
    ));
  };

  switch (variant) {
    case 'spinner':
      return (
        <div className={`flex flex-col items-center justify-center py-4 ${className}`}>
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          {text && <p className="text-sm text-muted-foreground">{text}</p>}
        </div>
      );
    
    case 'text':
      return (
        <div className={`flex items-center justify-center py-4 ${className}`}>
          <p className="text-sm text-muted-foreground">{text}</p>
        </div>
      );
    
    case 'skeleton':
    default:
      return <div className="space-y-2">{renderSkeletons()}</div>;
  }
};

// Create a conditional loading state component for easier usage
export const ConditionalLoading: React.FC<LoadingStateProps> = (props) => {
  const { isLoading, children, ...rest } = props;
  
  if (!isLoading) {
    return <>{children}</>;
  }
  
  return <LoadingState {...rest} />;
};
