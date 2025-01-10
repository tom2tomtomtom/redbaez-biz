import { Calendar, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { GeneralTaskRow } from "@/integrations/supabase/types/general-tasks.types";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

interface GeneralTaskItemProps {
  task: GeneralTaskRow;
  onDeleted?: () => void;
}

export const GeneralTaskItem = ({ task, onDeleted }: GeneralTaskItemProps) => {
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [dateValue, setDateValue] = useState(
    task.next_due_date ? new Date(task.next_due_date).toISOString().split('T')[0] : ''
  );
  const [isConverting, setIsConverting] = useState(false);
  const queryClient = useQueryClient();

  const getCategoryColor = (category: string | undefined) => {
    if (!category) return 'bg-orange-50 border-orange-100';
    
    switch (category.toLowerCase()) {
      case 'marketing':
        return 'bg-purple-50 border-purple-100';
      case 'product development':
        return 'bg-blue-50 border-blue-100';
      case 'partnerships':
        return 'bg-green-50 border-green-100';
      default:
        return 'bg-orange-50 border-orange-100';
    }
  };

  const getClientName = (title: string, category: string | undefined) => {
    if (category && ['marketing', 'product development', 'partnerships'].includes(category.toLowerCase())) {
      return category;
    }
    const match = title.match(/^\[([^\]]+)\]/);
    return match ? match[1] : 'Unknown Client';
  };

  const getTaskDescription = (description: string | null) => {
    if (!description) return 'No description';
    const colonIndex = description.indexOf(':');
    return colonIndex !== -1 ? description.slice(colonIndex + 1).trim() : description;
  };

  const handleDateChange = async (newDate: string) => {
    try {
      const { error } = await supabase
        .from('general_tasks')
        .update({ 
          next_due_date: newDate ? new Date(newDate).toISOString() : null,
          status: 'in_progress'
        })
        .eq('id', task.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['priorityClients'] });
      queryClient.invalidateQueries({ queryKey: ['generalTasks'] });
      
      toast({
        title: "Task updated",
        description: "The task has been converted and due date set.",
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update the task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEditingDate(false);
      setIsConverting(false);
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('general_tasks')
        .delete()
        .eq('id', task.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['generalTasks'] });
      onDeleted?.();
      
      toast({
        title: "Task deleted",
        description: "The task has been removed.",
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete the task. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card 
      className={cn(
        "p-4 hover:shadow-md transition-shadow border-2",
        getCategoryColor(task.category),
        task.urgent && "ring-2 ring-red-500"
      )}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-3">
          <div className="h-6 w-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
            {getClientName(task.title, task.category).charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="font-medium">{getClientName(task.title, task.category)}</span>
            <p className="text-sm text-gray-600 mt-1">
              {getTaskDescription(task.description)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {!task.next_due_date && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsConverting(true)}
            >
              Convert to Task
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div 
        className="mt-2 text-sm flex items-center gap-2 text-gray-500"
        onClick={(e) => {
          e.stopPropagation();
          if (task.next_due_date || isConverting) {
            setIsEditingDate(true);
          }
        }}
      >
        <Calendar size={14} />
        {(isEditingDate || isConverting) ? (
          <Input
            type="date"
            value={dateValue}
            onChange={(e) => setDateValue(e.target.value)}
            onBlur={(e) => {
              e.stopPropagation();
              handleDateChange(dateValue);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.stopPropagation();
                handleDateChange(dateValue);
              } else if (e.key === 'Escape') {
                e.stopPropagation();
                setIsEditingDate(false);
                setIsConverting(false);
                setDateValue(task.next_due_date ? new Date(task.next_due_date).toISOString().split('T')[0] : '');
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-40 h-7 px-2"
            autoFocus
          />
        ) : (
          <span className="cursor-pointer hover:text-gray-700">
            {task.next_due_date 
              ? `Due ${format(new Date(task.next_due_date), "MMM d, yyyy")}` 
              : 'Click to set due date'}
          </span>
        )}
      </div>
    </Card>
  );
};