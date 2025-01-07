import { Button } from '@/components/ui/button';
import { Edit, MoreHorizontal } from 'lucide-react';

interface ClientHeaderProps {
  client: {
    name: string;
    status: string | null;
    created_at: string;
    id: number;
  };
  onEditClick: () => void;
}

export const ClientHeader = ({ client, onEditClick }: ClientHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start bg-white p-6 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md">
      <div>
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-semibold text-gray-800">{client.name}</h1>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
            {client.status || 'New Client'}
          </span>
        </div>
        <p className="text-gray-500 mt-1">Client since {new Date(client.created_at).getFullYear()} · ID: {client.id}</p>
      </div>
      <div className="flex space-x-3 mt-4 md:mt-0">
        <Button 
          variant="outline" 
          className="flex items-center gap-2 transition-all duration-300"
          onClick={onEditClick}
        >
          <Edit size={16} />
          Edit
        </Button>
        <Button variant="outline" className="flex items-center gap-2 transition-all duration-300">
          <MoreHorizontal size={16} />
        </Button>
      </div>
    </div>
  );
};