
import { useEffect, useState } from 'react';
import { PriorityItem } from '../hooks/usePriorityData';
import { GeneralTaskItem } from '../GeneralTaskItem';
import { NextStepItem } from '../NextStepItem';
import { ItemControls } from './ItemControls';
import { GeneralTaskRow } from '@/integrations/supabase/types/general-tasks.types';
import { useNavigate } from 'react-router-dom';

interface PriorityListItemProps {
  item: PriorityItem;
  index: number;
  onTaskClick: (task: GeneralTaskRow) => void;
  onComplete: () => void;
  onUrgentChange: (checked: boolean) => void;
  onDelete: () => void;
}

export const PriorityListItem = ({
  item,
  index,
  onTaskClick,
  onComplete,
  onUrgentChange,
  onDelete
}: PriorityListItemProps) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  // When the component mounts, add a tiny delay before showing it (for the fade-in effect)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50 + index * 20);
    
    return () => clearTimeout(timer);
  }, [index]);

  const handleClick = () => {
    if (item.type === 'task') {
      if (item.data.client_id) {
        navigate(`/client/${item.data.client_id}`);
      } else {
        onTaskClick(item.data);
      }
    } else if (item.data.client_id) {
      navigate(`/client/${item.data.client_id}`);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
    }, 300); // Delay actual completion to allow animation
  };

  const handleDelete = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDelete();
    }, 300); // Delay actual deletion to allow animation
  };

  return (
    <div 
      className={`relative transition-all duration-500 transform ${
        isVisible 
          ? 'opacity-100 scale-100 max-h-96' 
          : 'opacity-0 scale-95 max-h-0 overflow-hidden margin-0 padding-0'
      }`}
      style={{
        transitionDelay: isVisible ? `${index * 50}ms` : '0ms',
      }}
    >
      <ItemControls
        item={item}
        onComplete={handleComplete}
        onUrgentChange={onUrgentChange}
        onDelete={handleDelete}
      />
      <div 
        className="transition-all duration-300 transform hover:scale-[1.01] hover:shadow-md rounded-lg cursor-pointer"
        onClick={handleClick}
      >
        {item.type === 'task' ? (
          <GeneralTaskItem task={item.data} />
        ) : (
          <NextStepItem nextStep={item.data} />
        )}
      </div>
    </div>
  );
};
