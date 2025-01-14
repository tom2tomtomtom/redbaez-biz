import { useState } from 'react';
import { PriorityItem } from './hooks/usePriorityData';
import { GeneralTaskRow } from '@/integrations/supabase/types/general-tasks.types';
import { CompletionDialog } from './components/CompletionDialog';
import { PriorityListItem } from './components/PriorityListItem';
import { useItemStatusChange } from './hooks/useItemStatusChange';

interface PriorityItemsListProps {
  items: PriorityItem[];
  onTaskClick: (task: GeneralTaskRow) => void;
}

export const PriorityItemsList = ({ items, onTaskClick }: PriorityItemsListProps) => {
  const [itemToComplete, setItemToComplete] = useState<PriorityItem | null>(null);
  const { handleCompletedChange, handleUrgentChange } = useItemStatusChange();

  const activeItems = items.filter(item => {
    if (item.type === 'task') {
      return item.data.status !== 'completed' && item.data.next_due_date !== null;
    }
    return !item.data.completed_at;
  });

  if (activeItems.length === 0) {
    return (
      <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
        <p className="text-gray-600 text-center">No priority actions found</p>
      </div>
    );
  }

  return (
    <>
      <CompletionDialog
        itemToComplete={itemToComplete}
        onOpenChange={() => setItemToComplete(null)}
        onComplete={(item) => handleCompletedChange(item, true)}
      />

      <div className="space-y-3">
        {activeItems.map((item, index) => (
          <PriorityListItem
            key={`${item.type}-${item.data.id}`}
            item={item}
            index={index}
            onTaskClick={onTaskClick}
            onComplete={() => setItemToComplete(item)}
            onUrgentChange={(checked) => handleUrgentChange(item, checked)}
          />
        ))}
      </div>
    </>
  );
};