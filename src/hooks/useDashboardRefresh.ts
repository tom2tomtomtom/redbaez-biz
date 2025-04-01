
/**
 * Hook to handle dashboard refresh logic.
 * This extracts refresh functionality from the Index.tsx component to reduce its size.
 */
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { useQueryManager } from './useQueryManager';

export const useDashboardRefresh = () => {
  const queryClient = useQueryClient();
  const queryManager = useQueryManager();

  const refreshDashboard = useCallback(async () => {
    toast({
      title: "Refreshing dashboard",
      description: "Updating with the latest data..."
    });
    
    try {
      // Clear all cached data
      await Promise.all([
        queryManager.invalidateAllQueries(),
        
        // Force remove specific cached queries
        queryClient.removeQueries({ queryKey: ['monthly-revenue'] }),
        queryClient.removeQueries({ queryKey: ['tasks'] }),
        queryClient.removeQueries({ queryKey: ['clients'] })
      ]);
      
      // Force refetch important data
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['monthly-revenue'] }),
        queryClient.refetchQueries({ queryKey: ['tasks'] }),
        queryClient.refetchQueries({ queryKey: ['clients'] })
      ]);
      
      return true;
    } catch (err) {
      console.error("Error refreshing dashboard:", err);
      toast({
        title: "Refresh failed",
        description: "Could not update dashboard data. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [queryClient, queryManager]);

  const initialLoadDashboard = useCallback(async () => {
    console.log("Initial dashboard load - refreshing data");
    
    // Show a toast to indicate the data is being loaded
    toast({
      title: "Loading dashboard",
      description: "Refreshing your dashboard data..."
    });
    
    // Clear all cached data first
    await Promise.all([
      queryClient.removeQueries({ queryKey: ['monthly-revenue'] }),
      queryClient.removeQueries({ queryKey: ['tasks'] }),
      queryClient.removeQueries({ queryKey: ['clients'] })
    ]);
    
    // Invalidate all query cache to ensure fresh data
    await queryManager.invalidateAllQueries();
    
    return true;
  }, [queryClient, queryManager]);

  return { refreshDashboard, initialLoadDashboard };
};
