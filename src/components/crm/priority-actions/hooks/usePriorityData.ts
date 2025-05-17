import logger from '@/utils/logger';

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase, logResponse } from "@/lib/supabaseClient";
import { PriorityItem } from "./taskTypes";
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
    queryFn: async () => {
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
        
        return response.data || [];
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

  // Map task data to the unified PriorityItem format
  const mapTasksToPriorityItems = (): PriorityItem[] => {
    if (!tasksData) {
      logger.info("No task data available to map");
      return [];
    }
    
    logger.info(`Mapping ${tasksData.length} tasks to priority items`);

    return tasksData.map((task) => {
      // Handle tasks with client relation
      if (task.client_id) {
        return {
          type: "next_step", // Changed from "next-step" to "next_step" to match the type definition
          data: {
            id: task.id,
            title: task.title,
            description: task.description,
            client_id: task.client_id,
            client_name: task.clients?.name || null,
            category: task.category,
            due_date: task.due_date,
            urgent: task.urgent,
            status: task.status,
          },
        };
      }

      // Handle general tasks
      return {
        type: "task",
        data: {
          id: task.id,
          title: task.title,
          description: task.description,
          category: task.category,
          due_date: task.due_date,
          urgent: task.urgent,
          status: task.status,
        },
      };
    });
  };

  // Sort priority items by urgency, then by due date
  const sortPriorityItems = (items: PriorityItem[]): PriorityItem[] => {
    return [...items].sort((a, b) => {
      // First sort by urgency
      if (a.data.urgent && !b.data.urgent) return -1;
      if (!a.data.urgent && b.data.urgent) return 1;

      // Then sort by due date (if both have one)
      if (a.data.due_date && b.data.due_date) {
        return new Date(a.data.due_date).getTime() - new Date(b.data.due_date).getTime();
      }

      // If only one has a due date, prioritize it
      if (a.data.due_date && !b.data.due_date) return -1;
      if (!a.data.due_date && b.data.due_date) return 1;

      return 0;
    });
  };

  // Get all priority items and sort them
  const priorityItems = sortPriorityItems(mapTasksToPriorityItems());
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
