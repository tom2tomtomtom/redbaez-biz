import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Edit2 } from 'lucide-react';

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
        variant="ghost"
        size="sm"
        className="flex items-center"
      >
        <Edit2 className="h-4 w-4 mr-2" />
        Edit
      </Button>
    </div>
  );
};