
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export const useTaskDeletion = (onTaskDeleted: () => void) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

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
      // Determine which table to use and the correct ID format
      let tableName = 'general_tasks';
      let taskId = task.id;
      
      // Handle next_step tasks that come from client_next_steps table
      if (task.type === 'next_step') {
        tableName = 'client_next_steps';
        // Extract the actual ID by removing the prefix if it exists
        if (typeof taskId === 'string' && taskId.startsWith('next-step-')) {
          taskId = taskId.replace('next-step-', '');
        }
      }
      
      console.log(`STRATEGY: Deleting from ${tableName} with ID: ${taskId} at ${new Date().toISOString()}`);
      
      // Perform the deletion with timestamp for debugging
      const { error, data } = await supabase
        .from(tableName)
        .delete()
        .eq('id', taskId)
        .select();
        
      if (error) {
        console.error('STRATEGY: Error deleting task:', error);
        toast({
          title: "Error",
          description: `Failed to delete task: ${error.message}`,
          variant: "destructive",
        });
        return false;
      }

      // Success
      console.log("STRATEGY: Task deleted successfully. Response:", data);
      
      // Aggressively invalidate and refetch all relevant query caches
      console.log("STRATEGY: Invalidating query cache after deletion");
      
      // First invalidate all related query keys
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['unified-tasks'] }),
        queryClient.invalidateQueries({ queryKey: ['generalTasks'] }),
        queryClient.invalidateQueries({ queryKey: ['clientNextSteps'] }),
        queryClient.invalidateQueries({ queryKey: ['priority-data'] }),
        queryClient.invalidateQueries({ queryKey: ['tasks'] }),
      ]);
      
      // Then force immediate refetches
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['unified-tasks'] }),
        queryClient.refetchQueries({ queryKey: ['generalTasks'] }),
        queryClient.refetchQueries({ queryKey: ['clientNextSteps'] }),
      ]);
      
      toast({
        title: "Task deleted",
        description: "The task has been deleted successfully.",
      });
      
      // Ensure the callback is triggered after everything is done
      setTimeout(() => {
        onTaskDeleted();
      }, 300);
      
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
