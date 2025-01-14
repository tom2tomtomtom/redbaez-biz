import { Tables } from '@/integrations/supabase/types';
import { Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NextStepItemProps {
  nextStep: Tables<'client_next_steps'> & { client_name?: string };
}

const getTypeColor = (type: string) => {
  // Always return orange colors for client tasks
  return 'bg-[#FEC6A1]/50 hover:bg-[#FEC6A1]';
};

export const NextStepItem = ({ nextStep }: NextStepItemProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (nextStep.client_id) {
      navigate(`/client/${nextStep.client_id}`);
    }
  };

  return (
    <div 
      className={`p-3 rounded-lg transition-all duration-300 hover:shadow-md ${getTypeColor(nextStep.client_name || '')} ${
        nextStep.urgent ? 'bg-red-50/50' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-3">
          <div className="h-6 w-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
            {nextStep.client_name?.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <span className="font-medium">{nextStep.client_name || 'Unknown Client'}</span>
            <p className="text-sm text-gray-600 mt-1">
              {nextStep.notes || 'No description'}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-2 text-sm flex items-center gap-2 text-gray-500">
        <Calendar size={14} />
        {nextStep.due_date 
          ? new Date(nextStep.due_date).toLocaleDateString()
          : 'No deadline set'}
      </div>
    </div>
  );
};