import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { ClientRow } from '@/integrations/supabase/types/clients.types';

interface PriorityActionItemProps {
  client: ClientRow;
}

export const PriorityActionItem = ({ client }: PriorityActionItemProps) => {
  const getInitial = (name: string | undefined | null) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  return (
    <Link 
      key={client.id} 
      to={`/client/${client.id}`}
      className="block"
    >
      <div className={`p-3 ${
        client.status === 'incomplete' ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100'
      } rounded-lg border`}>
        <div className="flex justify-between items-start">
          <div className="flex items-start space-x-3">
            <div className={`h-6 w-6 rounded-full ${
              client.status === 'incomplete' ? 'bg-red-500' : 'bg-orange-500'
            } flex items-center justify-center text-white text-xs font-bold`}>
              {getInitial(client.name)}
            </div>
            <div>
              <span className="font-medium">{client.name || 'Unnamed Client'}</span>
              <p className="text-sm text-gray-600 mt-1">
                Next Step: {client.notes || 'No next steps defined'}
              </p>
            </div>
          </div>
          <span className={`text-sm px-2 py-1 rounded-full ${
            client.status === 'incomplete' 
              ? 'bg-red-100 text-red-600' 
              : 'bg-orange-100 text-orange-600'
          }`}>
            {client.status === 'incomplete' ? 'Incomplete' : 'Review'}
          </span>
        </div>
        <div className="mt-2 text-sm flex items-center gap-2">
          <Calendar size={14} />
          Due: {client.next_due_date 
            ? new Date(client.next_due_date).toLocaleDateString()
            : 'No deadline set'}
        </div>
      </div>
    </Link>
  );
};