
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useTaskDeletion as useGlobalTaskDeletion } from "@/hooks/useTaskDeletion";

export const useTaskDeletion = (onTaskDeleted: () => void) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();
  const { deleteTask: globalDeleteTask } = useGlobalTaskDeletion(() => {
    // Function that runs after deletion is complete
    console.log("STRATEGY: Deletion callback executed");
    
    // Force refetch all relevant queries
    queryClient.fetchQuery({ queryKey: ['generalTasks'], staleTime: 0 });
    queryClient.fetchQuery({ queryKey: ['unified-tasks'], staleTime: 0 });
    
    // Call the passed callback after a slight delay to ensure UI update
    setTimeout(() => {
      onTaskDeleted();
    }, 300);
  });

  const deleteTask = async (task: any) => {
    if (!task) {
      console.error("No task provided for deletion");
      return false;
    }
    
    if (isDeleting) {
      console.log("Already processing a deletion, skipping");
      return false;
    }
    
    setIsDeleting(true);
    console.log("STRATEGY: Attempting to delete task:", task);
    
    try {
      // Pass the full task object to the global delete function
      // It will handle all the ID transformation logic internally
      const success = await globalDeleteTask(task);
      
      if (!success) {
        throw new Error("Failed to delete task");
      }
      
      return true;
    } catch (error) {
      console.error('STRATEGY: Unexpected error in deletion process:', error);
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
