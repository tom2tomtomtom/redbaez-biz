
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
      // Ensure we pass the task with properly formatted ID and source_table/type
      const taskToDelete = {
        ...task,
        // Make sure we preserve task ID information
        id: task.id,
        // Ensure we have source_table or type information for the core deletion function
        source_table: task.source_table || (task.type === 'next_step' ? 'client_next_steps' : 'general_tasks'),
        type: task.type || (task.source_table === 'client_next_steps' ? 'next_step' : 'task')
      };
      
      // Use the unified task deletion hook
      const success = await globalDeleteTask(taskToDelete);
      
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
