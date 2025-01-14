import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ClientContent } from './ClientContent';
import { ClientForm } from '../client-form/ClientForm';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import { useClientData } from './hooks/useClientData';
import { Contact } from './ContactInfoCard';

export const ClientDetails = () => {
  const { id } = useParams();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [nextSteps, setNextSteps] = useState('');
  const [nextDueDate, setNextDueDate] = useState('');
  
  // If we're on the "new" route, render the client form
  if (id === 'new') {
    return (
      <ClientForm
        contacts={contacts}
        nextSteps={nextSteps}
        nextDueDate={nextDueDate}
        onContactsChange={setContacts}
        onNextStepsChange={setNextSteps}
        onNextDueDateChange={setNextDueDate}
      />
    );
  }

  // Convert id to number for existing clients
  const clientId = parseInt(id || '', 10);
  
  // Validate client ID
  if (isNaN(clientId)) {
    return <ErrorState message="Invalid client ID" />;
  }

  const { data: client, isLoading, error } = useClientData(clientId);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error.message} />;
  }

  if (!client) {
    return <ErrorState message="Client not found" />;
  }

  // Parse and validate additional_contacts from JSON for existing clients
  const parsedAdditionalContacts: Contact[] = client.additional_contacts ? 
    (Array.isArray(client.additional_contacts) ? 
      client.additional_contacts.map((contact: any) => ({
        firstName: contact.firstName || '',
        lastName: contact.lastName || '',
        title: contact.title || '',
        email: contact.email || '',
        address: contact.address || '',
        phone: contact.phone || ''
      })) : 
      []
    ) : 
    [];

  return (
    <ClientContent 
      client={client}
      isEditing={false}
      parsedAdditionalContacts={parsedAdditionalContacts}
    />
  );
};