import { PriorityItem } from './hooks/usePriorityData';
import { GeneralTaskItem } from './GeneralTaskItem';
import { PriorityActionItem } from './PriorityActionItem';
import { Tables } from '@/integrations/supabase/types';

interface PriorityItemsListProps {
  items: PriorityItem[];
  onTaskClick: (task: Tables<'general_tasks'>) => void;
}

export const PriorityItemsList = ({ items, onTaskClick }: PriorityItemsListProps) => {
  if (items.length === 0) {
    return (
      <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
        <p className="text-gray-600 text-center">No priority actions found for this month</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        item.type === 'task' ? (
          <div 
            key={item.data.id} 
            onClick={() => onTaskClick(item.data as Tables<'general_tasks'>)} 
            className="cursor-pointer"
          >
            <GeneralTaskItem task={item.data as Tables<'general_tasks'>} />
          </div>
        ) : (
          <PriorityActionItem key={item.data.id} client={item.data} />
        )
      ))}
    </div>
  );
};