
import React from 'react';
import { LoadingState as StandardLoadingState } from '@/components/ui/loading-state';

export const LoadingState = () => {
  return (
    <StandardLoadingState 
      variant="spinner" 
      text="Loading client details..." 
      className="h-screen"
    />
  );
};
