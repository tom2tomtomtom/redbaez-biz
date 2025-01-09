import React from 'react';
import { BackButton } from './components/BackButton';
import { UrgentFlagToggle } from './components/UrgentFlagToggle';
import { TaskHistory } from './TaskHistory';

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
  onEditClick
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <BackButton />
        <h1 className="text-2xl font-semibold">{clientName}</h1>
      </div>
      <div className="flex items-center gap-4">
        <TaskHistory />
        <UrgentFlagToggle clientId={clientId} isUrgent={urgent || false} />
      </div>
    </div>
  );
};