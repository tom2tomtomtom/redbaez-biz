import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { GeneralTaskRow } from "@/integrations/supabase/types/general-tasks.types";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface GeneralTaskItemProps {
  task: GeneralTaskRow;
}

export const GeneralTaskItem = ({ task }: GeneralTaskItemProps) => {
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [dateValue, setDateValue] = useState(
    task.next_due_date ? new Date(task.next_due_date).toISOString().split('T')[0] : ''
  );
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

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "blocked":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getClientName = (title: string, category: string | undefined) => {
    // For special categories, just return the category name
    if (category && ['marketing', 'product development', 'partnerships'].includes(category.toLowerCase())) {
      return category;
    }
    // For other tasks, try to extract client name from title
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
        .update({ next_due_date: newDate ? new Date(newDate).toISOString() : null })
        .eq('id', task.id);

      if (error) throw error;

      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['priorityClients'] });
      queryClient.invalidateQueries({ queryKey: ['generalTasks'] });
      
      toast({
        title: "Date updated",
        description: "The task due date has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating date:', error);
      toast({
        title: "Error",
        description: "Failed to update the due date. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEditingDate(false);
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
        <div className={`px-2 py-1 rounded-full text-sm ${getStatusColor(task.status)}`}>
          {task.status || "pending"}
        </div>
      </div>
      <div 
        className="mt-2 text-sm flex items-center gap-2 text-gray-500"
        onClick={(e) => {
          e.stopPropagation();
          setIsEditingDate(true);
        }}
      >
        <Calendar size={14} />
        {isEditingDate ? (
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
                setDateValue(task.next_due_date ? new Date(task.next_due_date).toISOString().split('T')[0] : '');
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-40 h-7 px-2"
            autoFocus
          />
        ) : (
          <span className="cursor-pointer hover:text-gray-700">
            Due {task.next_due_date ? format(new Date(task.next_due_date), "MMM d, yyyy") : 'No date set'}
          </span>
        )}
      </div>
    </Card>
  );
};