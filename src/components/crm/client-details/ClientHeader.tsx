import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ClientHeaderProps {
  clientName: string;
  clientId: number;
  urgent?: boolean;
  onEditClick: () => void;
}

export const ClientHeader: React.FC<ClientHeaderProps> = ({
  clientName,
  clientId,
  urgent,
  onEditClick,
}) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">{clientName}</h1>
        <span className="text-gray-500">#{clientId}</span>
        {urgent && (
          <Badge variant="destructive" className="uppercase">
            Urgent
          </Badge>
        )}
      </div>
      <Button onClick={onEditClick} className="ml-4">
        Edit Client
      </Button>
    </div>
  );
};