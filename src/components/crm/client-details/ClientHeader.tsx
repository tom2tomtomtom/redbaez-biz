import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Pencil } from 'lucide-react';

interface ClientHeaderProps {
  clientName: string;
  clientId: number;
  urgent?: boolean;
  onEditClick: () => void;
}

export const ClientHeader = ({
  clientName,
  clientId,
  urgent,
  onEditClick,
}: ClientHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">{clientName}</h1>
        <span className="text-gray-500">#{clientId}</span>
        {urgent && (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle size={14} />
            Urgent
          </Badge>
        )}
      </div>
      <Button
        onClick={onEditClick}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Pencil size={16} />
        Edit Client Info
      </Button>
    </div>
  );
};