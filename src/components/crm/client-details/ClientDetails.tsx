import React, { useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Contact } from './ContactInfoCard';
import { useClientUpdate } from './useClientUpdate';
import { useClientInitialization } from './useClientInitialization';
import { ClientHeader } from './ClientHeader';
import { ClientEditMode } from './ClientEditMode';
import { ClientContent } from './ClientContent';
import { BackButton } from './components/BackButton';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import { useClientValidation } from './hooks/useClientValidation';
import { useClientData } from './hooks/useClientData';

export const ClientDetails = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { id } = useParams();
  
  // Validate and convert id parameter
  const numericId = id ? parseInt(id, 10) : null;
  if (!numericId || isNaN(numericId)) {
    console.error('Invalid client ID:', id);
    return <Navigate to="/" replace />;
  }

  const { data: client, isLoading, error } = useClientData(numericId);
  const { contacts, setContacts, nextSteps, setNextSteps, nextDueDate, setNextDueDate } = useClientInitialization(client);
  const updateMutation = useClientUpdate(numericId.toString(), () => setIsEditing(false));

  if (isLoading) return <LoadingState />;
  if (error || !client) return <ErrorState />;

  const handleSave = async (formData: any) => {
    console.log('Saving client with form data:', formData);
    console.log('Current contacts:', contacts);
    updateMutation.mutate({ 
      formData: {
        ...formData,
        notes: nextSteps || client.notes,
        next_due_date: nextDueDate || client.next_due_date
      }, 
      contacts 
    });
  };

  if (isEditing) {
    return (
      <ClientEditMode
        client={{
          ...client,
          notes: client.notes || '',
          next_due_date: client.next_due_date || ''
        }}
        contacts={contacts}
        nextSteps={client.notes || ''}
        nextDueDate={client.next_due_date ? new Date(client.next_due_date).toISOString().split('T')[0] : ''}
        onCancel={() => setIsEditing(false)}
        onSave={handleSave}
        onContactsChange={setContacts}
        onNextStepsChange={setNextSteps}
        onNextDueDateChange={setNextDueDate}
      />
    );
  }

  // Parse and validate additional_contacts from JSON
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
    <div className="flex flex-col space-y-6 p-8 w-full max-w-7xl mx-auto bg-gray-50/50 animate-fade-in overflow-y-auto min-h-screen">
      <BackButton />
      <ClientHeader 
        clientName={client.name}
        clientId={client.id}
        urgent={client.urgent}
        onEditClick={() => setIsEditing(true)}
      />
      <ClientContent 
        client={client}
        isEditing={isEditing}
        parsedAdditionalContacts={parsedAdditionalContacts}
      />
    </div>
  );
};