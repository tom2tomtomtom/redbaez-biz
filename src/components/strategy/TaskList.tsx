import { useState, useRef, useEffect } from "react";
import { GeneralTaskItem } from "../crm/priority-actions/GeneralTaskItem";
import { NextStepItem } from "../crm/priority-actions/NextStepItem";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Trash2, RefreshCw } from "lucide-react";
import { useTaskDeletion } from "./hooks/useTaskDeletion";
import { useQueryClient } from "@tanstack/react-query";

interface TaskListProps {
  tasks: any[];
  isLoading: boolean;
  onTasksUpdated: () => void;
  isHistory?: boolean;
}

export const TaskList = ({ tasks, isLoading, onTasksUpdated, isHistory = false }: TaskListProps) => {
  const [dateInputs, setDateInputs] = useState<Record<string, string>>({});
  const [taskToDelete, setTaskToDelete] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const initialRenderDone = useRef(false);
  const queryClient = useQueryClient();
  
  // Use our direct task deletion hook with a simple callback to avoid re-render loops
  const { deleteTask, isDeleting } = useTaskDeletion(() => {
    console.log("Deletion callback executed");
    // Force refetch
    queryClient.invalidateQueries({ queryKey: ['generalTasks'] });
    queryClient.invalidateQueries({ queryKey: ['clientNextSteps'] });
    
    // Using setTimeout to break potential render cycles
    setTimeout(() => {
      onTasksUpdated();
    }, 300);
  });

  // Run only once after initial render
  useEffect(() => {
    if (!initialRenderDone.current) {
      initialRenderDone.current = true;
      console.log("Strategy TaskList initial render completed");
    }
  }, []);

  const handleDateChange = async (taskId: string, date: string) => {
    try {
      const { error } = await supabase
        .from('general_tasks')
        .update({ 
          next_due_date: date ? new Date(date).toISOString() : null,
          status: 'incomplete'
        })
        .eq('id', taskId);

      if (error) throw error;

      setDateInputs(prev => {
        const newInputs = { ...prev };
        delete newInputs[taskId];
        return newInputs;
      });

      toast({
        title: "Task updated",
        description: date ? "Task has been moved to active tasks." : "Date removed from task.",
      });

      // Use setTimeout to break potential render cycles
      setTimeout(() => {
        onTasksUpdated();
      }, 300);
    } catch (error) {
      console.error('Error updating task date:', error);
      toast({
        title: "Error",
        description: "Failed to update task date. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (task: any) => {
    console.log("Delete button clicked for task:", task);
    setTaskToDelete(task);
    setIsDialogOpen(true);
  };

  const confirmDeleteTask = async () => {
    console.log("Confirming deletion for task:", taskToDelete);
    if (taskToDelete) {
      await deleteTask(taskToDelete);
    }
    setIsDialogOpen(false);
    setTaskToDelete(null);
  };

  const cancelDelete = () => {
    setIsDialogOpen(false);
    setTaskToDelete(null);
  };

  const handleManualRefresh = () => {
    console.log("Manual refresh requested");
    queryClient.invalidateQueries({ queryKey: ['generalTasks'] });
    queryClient.invalidateQueries({ queryKey: ['clientNextSteps'] });
    onTasksUpdated();
  };

  // Filter tasks based on whether they're completed and have due dates
  const filteredTasks = tasks.filter(task => {
    if (isHistory) {
      return task.status === 'completed';
    }
    
    // For active tasks section, show tasks with due dates
    if (!isHistory && task.next_due_date) {
      return task.status !== 'completed';
    }
    
    // For ideas section, show tasks without due dates
    return task.status !== 'completed' && !task.next_due_date;
  });

  // Sort tasks by due date if they have one
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (!a.next_due_date || !b.next_due_date) return 0;
    return new Date(a.next_due_date).getTime() - new Date(b.next_due_date).getTime();
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!sortedTasks.length) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p className="mb-4">
          {isHistory 
            ? "No completed tasks yet"
            : "No tasks found"
          }
        </p>
        <Button onClick={handleManualRefresh} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Tasks
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <Button onClick={handleManualRefresh} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Tasks
        </Button>
      </div>
      
      {sortedTasks.map((task) => (
        <div key={task.id} className="relative space-y-2 border p-4 rounded-md shadow-sm hover:shadow-md transition-shadow">
          <div className="flex">
            <div className="flex-1">
              {task.type === 'next_step' ? (
                <NextStepItem nextStep={task.original_data} />
              ) : (
                <GeneralTaskItem 
                  task={task}
                  isClientTask={!!task.client_id}
                />
              )}
            </div>
            {!isHistory && (
              <Button 
                variant="ghost" 
                size="sm"
                className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(task);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          {!isHistory && !task.next_due_date && task.type !== 'next_step' && (
            <div className="flex items-center gap-2 px-6">
              <Input
                type="date"
                value={dateInputs[task.id] || ''}
                onChange={(e) => {
                  setDateInputs(prev => ({
                    ...prev,
                    [task.id]: e.target.value
                  }));
                }}
                className="max-w-[200px]"
              />
              <Button 
                variant="outline" 
                onClick={() => handleDateChange(task.id, dateInputs[task.id])}
              >
                Set Due Date
              </Button>
            </div>
          )}
        </div>
      ))}

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteTask} 
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
