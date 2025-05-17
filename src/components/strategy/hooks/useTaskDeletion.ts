import logger from '@/utils/logger';

import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useTaskDeletion as useGlobalTaskDeletion } from "@/hooks/useTaskDeletion";
import { queryKeys } from "@/lib/queryKeys";

/**
 * Simplified strategy-specific hook for task deletion
 */
export const useTaskDeletion = (onTaskDeleted?: () => void) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();
  
  // Use the core deletion hook with a simpler callback
  const { deleteTask: globalDeleteTask } = useGlobalTaskDeletion(() => {
    logger.info("[STRATEGY] Deletion callback executed");
    
    // Specifically refetch the strategy-relevant queries
    queryClient.refetchQueries({ queryKey: queryKeys.tasks.general() });
    queryClient.refetchQueries({ queryKey: queryKeys.tasks.unified() });
    queryClient.refetchQueries({ queryKey: ['tasks'] });
    
    // Call the passed callback
    if (onTaskDeleted) {
      setTimeout(onTaskDeleted, 100);
    }
  });

  const deleteTask = async (task: any) => {
    if (!task) {
      logger.error("[STRATEGY] No task provided for deletion");
      return false;
    }
    
    if (isDeleting) {
      return false;
    }
    
    setIsDeleting(true);
    
    try {
      // Simply pass the task to the global delete function
      const success = await globalDeleteTask(task);
      return success;
    } catch (error) {
      logger.error('[STRATEGY] Error in deletion process:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteTask, isDeleting };
};
