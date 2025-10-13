import logger from '@/utils/logger';

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase, logResponse } from "@/lib/supabaseClient";
import { mapTaskRowToTask, PriorityItem, SupabaseTaskRow } from "./taskTypes";
import { Task } from "@/types/task";
import { queryKeys } from "@/lib/queryKeys";

// Re-export the PriorityItem type to make it available to components
export type { PriorityItem };

/**
 * Hook to fetch priority items (tasks, next steps, etc.)
 * for the priority dashboard
 */
export const usePriorityData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Fetches all incomplete tasks
  const { data: tasksData, refetch: refetchTasks } = useQuery({
    queryKey: queryKeys.tasks.unified(),
    queryFn: async (): Promise<Task[]> => {
      logger.info("Fetching incomplete tasks...");
      setIsLoading(true);

      try {
        // Fetch all incomplete tasks
        const response = await supabase
          .from("tasks")
          .select("*, clients(name)")
          .eq("status", "incomplete")
          .order("urgent", { ascending: false })
          .order("due_date", { ascending: true });
        
        logResponse(response, response.error, "usePriorityData");
        
        if (response.error) {
          logger.error("Error fetching tasks:", response.error);
          throw response.error;
        }

        setIsLoading(false);
        logger.info(`Successfully fetched ${response.data?.length || 0} tasks`);
        
        // Add debug output of first task if available
        if (response.data && response.data.length > 0) {
          logger.info("Sample task:", response.data[0]);
        } else {
          logger.info("No tasks returned from the database");
        }
        
        const rows = (response.data || []) as SupabaseTaskRow[];
        return rows.map(mapTaskRowToTask);
      } catch (error) {
        logger.error("Error in fetchTasks:", error);
        setIsLoading(false);
        throw error;
      }
    },
    staleTime: 0, // Don't cache results
    gcTime: 0,    // Don't keep old results
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Sort tasks by urgency, then by due date
  const sortTasks = (items: Task[]): Task[] => {
    return [...items].sort((a, b) => {
      if ((a.urgent ?? false) && !(b.urgent ?? false)) return -1;
      if (!(a.urgent ?? false) && (b.urgent ?? false)) return 1;

      const aDue = a.due_date || a.next_due_date;
      const bDue = b.due_date || b.next_due_date;

      if (aDue && bDue) {
        return new Date(aDue).getTime() - new Date(bDue).getTime();
      }

      if (aDue && !bDue) return -1;
      if (!aDue && bDue) return 1;

      return 0;
    });
  };

  const priorityItems: PriorityItem[] = sortTasks(tasksData || []);
  logger.info(`Total priority items after sorting: ${priorityItems.length}`);

  // Refetch all data
  const refreshAllData = async () => {
    logger.info("Refreshing all priority data...");
    setIsLoading(true);
    
    try {
      // Force invalidate all related query caches to ensure fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.unified() });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all() });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
      // Force a refetch
      await refetchTasks();
      
      logger.info("Data refresh complete");
    } catch (error) {
      logger.error("Error refreshing priority data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    priorityItems,
    isLoading,
    refreshAllData,
  };
};
