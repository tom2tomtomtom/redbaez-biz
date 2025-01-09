import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { GeneralTaskRow } from "@/integrations/supabase/types/general-tasks.types";
import { cn } from "@/lib/utils";

interface GeneralTaskItemProps {
  task: GeneralTaskRow;
}

export const GeneralTaskItem = ({ task }: GeneralTaskItemProps) => {
  const getCategoryColor = (category: string | undefined) => {
    if (!category) return 'bg-gray-50 border-gray-100';
    
    switch (category.toLowerCase()) {
      case 'marketing':
        return 'bg-purple-50 border-purple-100';
      case 'product development':
        return 'bg-blue-50 border-blue-100';
      case 'partnerships':
        return 'bg-green-50 border-green-100';
      default:
        return 'bg-gray-50 border-gray-100';
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

  return (
    <Card 
      className={cn(
        "p-4 hover:shadow-md transition-shadow border-2",
        getCategoryColor(task.category),
        task.urgent && "ring-2 ring-red-500"
      )}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h3 className="font-medium">{task.title}</h3>
        </div>
        <div className={`px-2 py-1 rounded-full text-sm ${getStatusColor(task.status)}`}>
          {task.status || "pending"}
        </div>
      </div>
      {task.next_due_date && (
        <div className="mt-2 text-sm flex items-center gap-2 text-gray-500">
          <Calendar size={14} />
          <span>Due {format(new Date(task.next_due_date), "MMM d, yyyy")}</span>
        </div>
      )}
    </Card>
  );
};