
import { useEffect, useState } from 'react';
import { PriorityItem } from '../hooks/usePriorityData';
import { GeneralTaskItem } from '../GeneralTaskItem';
import { ItemControls } from './ItemControls';
import { taskToGeneralTaskRow, Task } from '@/integrations/supabase/types/general-tasks.types';
import { useNavigate } from 'react-router-dom';

interface PriorityListItemProps {
  item: PriorityItem;
  index: number;
  onTaskClick: (taskId: string) => void;
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
    if (item.data.client_id) {
      navigate(`/client/${item.data.client_id}`);
    } else {
      onTaskClick(item.data.id);
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

  // Convert PriorityItem to Task format for GeneralTaskItem
  const convertToTaskFormat = (): Task => {
    return {
      id: item.data.id,
      title: item.data.title,
      description: item.data.description || null,
      client_id: item.data.client_id || null,
      client: item.data.client || null,
      due_date: item.data.due_date || null,
      urgent: item.data.urgent,
      status: item.data.status as "incomplete" | "completed" || "incomplete",
      completed_at: item.data.completed_at || null,
      category: item.data.category || null,
      type: item.type === "next_step" ? "next_step" : "task",
      source_table: item.type === "next_step" ? "client_next_steps" : "general_tasks"
    };
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
        <GeneralTaskItem 
          task={convertToTaskFormat()} 
          isClientTask={!!item.data.client_id}
        />
      </div>
    </div>
  );
};
