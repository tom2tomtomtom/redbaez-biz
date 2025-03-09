
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
    
    setIsDeleting(true);
    console.log("Attempting to delete task:", task);
    
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
      
      console.log(`Deleting from ${tableName} with ID: ${taskId}`);
      
      // Perform the deletion with a timestamp header
      const headers = {
        'X-Custom-Timestamp': new Date().toISOString()
      };
      
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', taskId);
        
      if (error) {
        console.error('Error deleting task:', error);
        toast({
          title: "Error",
          description: `Failed to delete task: ${error.message}`,
          variant: "destructive",
        });
        return false;
      }

      // Success
      console.log("Task deleted successfully");
      
      // Invalidate all relevant queries to ensure UI updates
      await queryClient.invalidateQueries({ 
        queryKey: ['unified-tasks'],
        exact: false 
      });
      
      await queryClient.invalidateQueries({ 
        queryKey: ['generalTasks'],
        exact: false
      });
      
      await queryClient.invalidateQueries({ 
        queryKey: ['clientNextSteps'],
        exact: false
      });
      
      // Force an immediate refetch of the task lists
      await queryClient.refetchQueries({ 
        queryKey: ['unified-tasks'],
        exact: false
      });
      
      toast({
        title: "Task deleted",
        description: "The task has been deleted successfully.",
      });
      
      // Call the callback to refresh the task list
      setTimeout(() => {
        onTaskDeleted();
      }, 100);
      
      return true;
    } catch (error) {
      console.error('Unexpected error in deletion process:', error);
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
