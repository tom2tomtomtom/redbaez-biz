import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Contact } from './client-details/ContactInfoCard';
import { useClientUpdate } from './client-details/useClientUpdate';
import { useClientInitialization } from './client-details/useClientInitialization';
import { ClientHeader } from './client-details/ClientHeader';
import { ClientEditMode } from './client-details/ClientEditMode';
import { ClientContent } from './client-details/ClientContent';
import { BackButton } from './client-details/components/BackButton';

export const ClientDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [nextSteps, setNextSteps] = useState('');
  const [nextDueDate, setNextDueDate] = useState('');

  // Validate and convert id parameter
  const numericId = id ? parseInt(id, 10) : null;
  if (!numericId || isNaN(numericId)) {
    console.error('Invalid client ID:', id);
    return <Navigate to="/" replace />;
  }

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

  // Initialize nextSteps and nextDueDate when client data is loaded or editing mode changes
  useEffect(() => {
    if (client && isEditing) {
      setNextSteps(client.notes || '');
      setNextDueDate(client.next_due_date ? new Date(client.next_due_date).toISOString().split('T')[0] : '');
    }
  }, [client, isEditing]);

  const updateMutation = useClientUpdate(numericId.toString(), () => setIsEditing(false));

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (error || !client) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 mb-4">Error loading client details</p>
        <BackButton />
      </div>
    );
  }

  const handleSave = async (formData: any) => {
    console.log('Saving client with form data:', formData);
    console.log('Current contacts:', contacts);
    updateMutation.mutate({ 
      formData: {
        ...formData,
        notes: nextSteps,
        next_due_date: nextDueDate
      }, 
      contacts 
    });
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