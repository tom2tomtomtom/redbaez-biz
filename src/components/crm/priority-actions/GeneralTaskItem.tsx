import { cn } from "@/lib/utils";
import { Tables } from "@/integrations/supabase/types";

type GeneralTaskRow = Tables<'general_tasks'>;

const getCategoryColor = (task: GeneralTaskRow, isClientTask: boolean) => {
  console.log('Task category:', task.category);
  console.log('Is client task:', isClientTask);
  console.log('Task details:', task);
  
  // If it's a client task, a strategic idea connected to a client, or a next step for a client
  // always return orange colors
  if (isClientTask) {
    console.log('Returning client color');
    return 'bg-orange-100 hover:bg-orange-200';
  }

  const category = task.category?.toLowerCase() || '';
  console.log('Processing category:', category);

  // Business Admin tasks
  if (category === 'business admin') {
    console.log('Business admin task colors');
    return '!bg-gray-100 hover:!bg-gray-200';
  }

  // Marketing tasks
  if (category === 'marketing') {
    console.log('Marketing task colors - applying bg-[#F0D4FA]/50');
    return '!bg-[#F0D4FA]/50 hover:!bg-[#F0D4FA]/70';
  }
  
  // Product Development tasks
  if (category === 'product development') {
    console.log('Product development task colors');
    return '!bg-blue-100 hover:!bg-blue-200';
  }
  
  // Partnerships tasks
  if (category === 'partnerships') {
    console.log('Partnerships task colors');
    return '!bg-green-100 hover:!bg-green-200';
  }

  // Default color
  return 'bg-gray-50 hover:bg-gray-100';
};

export const GeneralTaskItem = ({ task, isClientTask = false }: { task: GeneralTaskRow; isClientTask?: boolean }) => {
  const colorClasses = getCategoryColor(task, isClientTask);

  return (
    <div className={cn(
      "p-4 rounded-lg transition-colors",
      colorClasses,
      "relative group"
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{task.title}</h3>
          {task.description && (
            <p className="mt-1 text-sm text-gray-500">{task.description}</p>
          )}
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