import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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

export const ClientDetails = () => {
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [nextSteps, setNextSteps] = useState('');
  const [nextDueDate, setNextDueDate] = useState('');

  const { isValid, numericId } = useClientValidation(id);
  if (!isValid) return <Navigate to="/" replace />;

  const { data: client, isLoading, error } = useQuery({
    queryKey: ['client', numericId],
    queryFn: async () => {
      console.log('Fetching client data for ID:', numericId);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', numericId)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error('Client not found');
      
      console.log('Received client data:', data);
      return data;
    },
  });

  const { contacts, setContacts } = useClientInitialization(client);
  const updateMutation = useClientUpdate(numericId.toString(), () => setIsEditing(false));

  if (isLoading) return <LoadingState />;
  if (error || !client) return <ErrorState />;

  const handleSave = async (formData: any) => {
    console.log('Saving client with form data:', formData);
    console.log('Current contacts:', contacts);
    updateMutation.mutate({ formData, contacts });
  };

  if (isEditing) {
    return (
      <ClientEditMode
        client={client}
        contacts={contacts}
        nextSteps={nextSteps}
        nextDueDate={nextDueDate}
        onCancel={() => setIsEditing(false)}
        onSave={handleSave}
        onContactsChange={setContacts}
        onNextStepsChange={setNextSteps}
        onNextDueDateChange={setNextDueDate}
      />
    );
  }

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
        client={client}
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