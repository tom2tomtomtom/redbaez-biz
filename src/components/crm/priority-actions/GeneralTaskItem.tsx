import { cn } from "@/lib/utils";
import { Tables } from "@/integrations/supabase/types";

type GeneralTaskRow = Tables<'general_tasks'>;

const getCategoryColor = (task: GeneralTaskRow, isClientTask: boolean) => {
  // If it's a client task (either from strategic recommendations or client-related)
  if (isClientTask || task.client_id) {
    return 'bg-[#FEC6A1]/50 hover:bg-[#FEC6A1]/70';
  }

  const category = task.category?.toLowerCase() || '';

  // Business Admin tasks
  if (category === 'business admin') {
    return 'bg-gray-100 hover:bg-gray-200';
  }

  // Marketing tasks
  if (category === 'marketing') {
    return 'bg-[#F0D4FA]/50 hover:bg-[#F0D4FA]/70';
  }
  
  // Product Development tasks
  if (category === 'product development') {
    return 'bg-blue-100 hover:bg-blue-200';
  }
  
  // Partnerships tasks
  if (category === 'partnerships') {
    return 'bg-green-100 hover:bg-green-200';
  }

  // Default color
  return 'bg-gray-50 hover:bg-gray-100';
};

export const GeneralTaskItem = ({ task, isClientTask = false }: { task: GeneralTaskRow; isClientTask?: boolean }) => {
  const colorClasses = getCategoryColor(task, isClientTask);
  
  // Extract client name from title if it's a strategic recommendation
  const titleMatch = task.title.match(/Strategic Recommendation for (.+)/);
  const displayTitle = titleMatch ? `${titleMatch[1]} Strategic Recommendation` : task.title;
  
  // Clean up description - remove any client prefix and format metadata
  let displayDescription = task.description || 'No description provided';
  if (titleMatch && displayDescription.includes('Type:')) {
    const [metadata, ...contentParts] = displayDescription.split('\n\n');
    displayDescription = contentParts.join('\n\n');
  }

  return (
    <div className={cn(
      "p-4 rounded-lg transition-colors",
      colorClasses,
      "relative group"
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{displayTitle}</h3>
          <p className="mt-1 text-sm text-gray-500">{displayDescription}</p>
          {task.next_due_date && (
            <p className="mt-2 text-sm text-gray-500">
              Due: {new Date(task.next_due_date).toLocaleDateString()}
            </p>
          )}
        </div>
        {task.urgent && (
          <span className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
            Urgent
          </span>
        )}
      </div>
    </div>
  );
};