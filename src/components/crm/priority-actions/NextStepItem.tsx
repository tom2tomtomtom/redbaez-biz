import { Tables } from '@/integrations/supabase/types';

interface NextStepItemProps {
  nextStep: Tables<'client_next_steps'> & { client_name?: string };
}

const getTypeColor = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'product development':
      return 'bg-blue-50 border-blue-100';
    case 'marketing':
      return 'bg-purple-50 border-purple-100';
    case 'partnerships':
      return 'bg-green-50 border-green-100';
    default:
      return 'bg-orange-50 border-orange-100';
  }
};

export const NextStepItem = ({ nextStep }: NextStepItemProps) => {
  return (
    <div className={`p-3 rounded-lg border ${getTypeColor(nextStep.client_name || '')}`}>
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
      <div className="mt-2 text-sm flex items-center gap-2">
        <Calendar size={14} />
        Due: {nextStep.due_date 
          ? new Date(nextStep.due_date).toLocaleDateString()
          : 'No deadline set'}
      </div>
    </div>
  );
};