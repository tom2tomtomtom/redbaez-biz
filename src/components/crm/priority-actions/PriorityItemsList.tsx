import { PriorityItem } from './hooks/usePriorityData';
import { PriorityListItem } from './components/PriorityListItem';

interface PriorityItemsListProps {
  items: PriorityItem[];
  onTaskClick?: (task: any) => void;
  onComplete?: (item: PriorityItem) => void;
  onUrgentChange?: (item: PriorityItem, urgent: boolean) => void;
}

export const PriorityItemsList = ({
  items,
  onTaskClick,
  onComplete,
  onUrgentChange
}: PriorityItemsListProps) => {
  // Show items that are either:
  // 1. Tasks that are incomplete
  // 2. Next steps that are not completed
  const activeItems = items.filter(item => {
    if (item.type === 'task') {
      return item.data.status !== 'completed';
    } else {
      return !item.data.completed_at;
    }
  });

  if (activeItems.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        No active priority items
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activeItems.map((item) => (
        <PriorityListItem
          key={`${item.type}-${item.data.id}`}
          item={item}
          onTaskClick={onTaskClick}
          onComplete={onComplete}
          onUrgentChange={onUrgentChange}
        />
      ))}
    </div>
  );
};