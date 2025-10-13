import { cn } from "@/lib/utils";
import { Task } from '@/types/task';

const getCategoryColor = (task: Task, isClientTask: boolean) => {
  if (isClientTask || task.client_id) {
    return 'bg-[#FEC6A1]/50 hover:bg-[#FEC6A1]/70';
  }

  const category = task.category?.toLowerCase() || '';

  if (category === 'business admin') {
    return 'bg-gray-100 hover:bg-gray-200';
  }

  if (category === 'marketing') {
    return 'bg-[#F0D4FA]/50 hover:bg-[#F0D4FA]/70';
  }
  
  if (category === 'product development') {
    return 'bg-blue-100 hover:bg-blue-200';
  }
  
  if (category === 'partnerships') {
    return 'bg-green-100 hover:bg-green-200';
  }

  return 'bg-gray-50 hover:bg-gray-100';
};

export const GeneralTaskItem = ({ task, isClientTask = false }: { task: Task; isClientTask?: boolean }) => {
  const colorClasses = getCategoryColor(task, isClientTask);

  const titleMatch = task.title.match(/Strategic Recommendation for (.+)/);
  const displayTitle = titleMatch ? `${titleMatch[1]} Strategic Recommendation` : task.title;

  let displayDescription = task.description || 'No description provided';
  if (titleMatch && displayDescription.includes('Type:')) {
    const [metadata, ...contentParts] = displayDescription.split('\n\n');
    displayDescription = contentParts.join('\n\n');
  }

  const dueDate = task.next_due_date || task.due_date;
  const isOverdue = dueDate ? new Date(dueDate) < new Date() : false;

  return (
    <div className={cn(
      "p-6 rounded-lg transition-colors text-left",
      colorClasses,
      "relative group"
    )}>
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 mb-2">{displayTitle}</h3>
          <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{displayDescription}</p>
          {dueDate && (
            <p className={cn(
              "mt-3 text-sm flex items-center",
              isOverdue ? "text-red-600 font-medium" : "text-gray-500"
            )}>
              Due: {new Date(dueDate).toLocaleDateString()}
            </p>
          )}
        </div>
        {(task.urgent ?? false) && (
          <span className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full shrink-0">
            Urgent
          </span>
        )}
      </div>
    </div>
  );
};