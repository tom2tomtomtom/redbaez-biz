import { PriorityItem } from '../hooks/usePriorityData';
import { GeneralTaskItem } from '../GeneralTaskItem';
import { PriorityActionItem } from '../PriorityActionItem';
import { NextStepItem } from '../NextStepItem';
import { ItemControls } from './ItemControls';
import { GeneralTaskRow } from '@/integrations/supabase/types/general-tasks.types';
import { ClientRow } from '@/integrations/supabase/types/clients.types';
import { useState, useEffect } from 'react';

interface PriorityListItemProps {
  item: PriorityItem;
  index: number;
  onTaskClick: (task: GeneralTaskRow) => void;
  onComplete: () => void;
  onUrgentChange: (checked: boolean) => void;
}

export const PriorityListItem = ({
  item,
  index,
  onTaskClick,
  onComplete,
  onUrgentChange
}: PriorityListItemProps) => {
  const [isReordering, setIsReordering] = useState(false);
  const [prevUrgent, setPrevUrgent] = useState('urgent' in item.data ? item.data.urgent : false);

  useEffect(() => {
    const currentUrgent = 'urgent' in item.data ? item.data.urgent : false;
    if (prevUrgent !== currentUrgent) {
      setIsReordering(true);
      const timer = setTimeout(() => {
        setIsReordering(false);
      }, 500); // Match the duration of the reorder animation
      setPrevUrgent(currentUrgent);
      return () => clearTimeout(timer);
    }
  }, [item.data, prevUrgent]);

  return (
    <div 
      className={`relative transition-all duration-500 transform ${
        isReordering ? 'animate-reorder-up' : 'animate-fade-in'
      }`}
      style={{
        transitionDelay: `${index * 50}ms`,
      }}
    >
      <ItemControls
        item={item}
        onComplete={onComplete}
        onUrgentChange={onUrgentChange}
      />
      <div className="transition-all duration-300 transform hover:scale-[1.01] hover:shadow-md rounded-lg">
        {item.type === 'task' ? (
          <div 
            onClick={() => onTaskClick(item.data as GeneralTaskRow)}
            className="cursor-pointer"
          >
            <GeneralTaskItem task={item.data as GeneralTaskRow} />
          </div>
        ) : item.type === 'client' ? (
          <PriorityActionItem client={item.data as ClientRow} />
        ) : (
          <NextStepItem nextStep={item.data} />
        )}
      </div>
    </div>
  );
};