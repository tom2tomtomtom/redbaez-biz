import { Tables } from '@/integrations/supabase/types';
import { Calendar } from 'lucide-react';

interface NextStepItemProps {
  nextStep: Tables<'client_next_steps'> & { client_name?: string };
}

export const NextStepItem = ({ nextStep }: NextStepItemProps) => {
  return (
    <div className="p-3 bg-blue-50 border-blue-100 rounded-lg border">
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-3">
          <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
            {nextStep.client_name?.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <span className="font-medium">{nextStep.client_name || 'Unknown Client'}</span>
            <p className="text-sm text-gray-600 mt-1">
              {nextStep.notes || 'No description'}
            </p>
          </div>
        </div>
        <span className="text-sm px-2 py-1 rounded-full bg-blue-100 text-blue-600">
          Next Step
        </span>
      </div>
      <div className="mt-2 text-sm flex items-center gap-2">
        <Calendar size={14} />
        Due: {nextStep.due_date 
          ? new Date(nextStep.due_date).toLocaleDateString()
          : 'No deadline set'}
      </div>
    </div>
  );
};