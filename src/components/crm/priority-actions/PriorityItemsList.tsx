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
  // Show only items that:
  // 1. For tasks: are incomplete AND have a due date
  // 2. For next steps: are not completed
  const activeItems = items.filter(item => {
    if (item.type === 'task') {
      const task = item.data as any;
      return task.status !== 'completed' && task.next_due_date !== null;
    } else {
      const nextStep = item.data as any;
      return !nextStep.completed_at;
    }
  });

  if (activeItems.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        No active items
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activeItems.map((item) => (
        <PriorityListItem
          key={item.data.id}
          item={item}
          onTaskClick={onTaskClick}
          onComplete={onComplete}
          onUrgentChange={onUrgentChange}
        />
      ))}
    </div>
  );
};