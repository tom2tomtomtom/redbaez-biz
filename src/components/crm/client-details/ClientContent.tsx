import React from 'react';
import { Contact } from './ContactInfoCard';
import { AdditionalInfoCard } from './AdditionalInfoCard';
import { KeyMetricsCard } from './KeyMetricsCard';
import { ContactInfoCard } from './ContactInfoCard';
import { StatusTab } from './StatusTab';
import { TaskHistory } from './TaskHistory';

interface ClientContentProps {
  client: any;
  isEditing: boolean;
  parsedAdditionalContacts: Contact[];
}

export const ClientContent = ({ client, isEditing, parsedAdditionalContacts }: ClientContentProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <ContactInfoCard
          client={client}
          additionalContacts={parsedAdditionalContacts}
        />
        <AdditionalInfoCard client={client} />
      </div>
      <div className="space-y-6">
        <KeyMetricsCard client={client} />
        <div className="flex flex-col gap-4">
          <StatusTab client={client} />
          <TaskHistory clientId={client.id} />
        </div>
      </div>
    </div>
  );
};