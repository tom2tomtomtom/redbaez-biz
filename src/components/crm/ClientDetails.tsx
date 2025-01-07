import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { KeyMetricsCard } from './client-details/KeyMetricsCard';
import { ContactInfoCard } from './client-details/ContactInfoCard';
import { AdditionalInfoCard } from './client-details/AdditionalInfoCard';
import { useClientUpdate } from './client-details/useClientUpdate';
import { useClientInitialization } from './client-details/useClientInitialization';
import { Contact } from './client-details/ContactInfoCard';
import { ClientHeader } from './client-details/ClientHeader';
import { ClientEditMode } from './client-details/ClientEditMode';

export const ClientDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [nextSteps, setNextSteps] = useState('');
  const [nextDueDate, setNextDueDate] = useState('');

  const { data: client, isLoading, error } = useQuery({
    queryKey: ['client', id],
    queryFn: async () => {
      console.log('Fetching client data for ID:', id);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      console.log('Received client data:', data);
      return data;
    },
  });

  const { contacts, setContacts } = useClientInitialization(client);
  const updateMutation = useClientUpdate(id, () => setIsEditing(false));

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (error || !client) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 mb-4">Error loading client details</p>
        <Button onClick={() => navigate('/')}>Back to Home</Button>
      </div>
    );
  }

  const handleSave = async (formData: any) => {
    console.log('Saving client with form data:', formData);
    console.log('Current contacts:', contacts);
    updateMutation.mutate({ formData, contacts });
  };

  const revenueData = [
    { month: 'Jan', value: client.annual_revenue ? client.annual_revenue / 12 : 0 },
    { month: 'Feb', value: client.annual_revenue ? client.annual_revenue / 12 : 0 },
    { month: 'Mar', value: client.annual_revenue ? client.annual_revenue / 12 : 0 },
    { month: 'Apr', value: client.annual_revenue ? client.annual_revenue / 12 : 0 },
    { month: 'May', value: client.annual_revenue ? client.annual_revenue / 12 : 0 },
    { month: 'Jun', value: client.annual_revenue ? client.annual_revenue / 12 : 0 }
  ];

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
      <Button
        variant="ghost"
        className="w-fit flex items-center gap-2"
        onClick={() => navigate('/')}
      >
        <ArrowLeft size={16} />
        Back to Home
      </Button>

      <ClientHeader 
        client={client}
        onEditClick={() => setIsEditing(true)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <KeyMetricsCard 
          annualRevenue={client.annual_revenue}
          projectRevenue={client.project_revenue}
          likelihood={client.likelihood}
          revenueData={revenueData}
        />

        <ContactInfoCard 
          contactName={client.contact_name}
          companySize={client.company_size}
          contactEmail={client.contact_email}
          contactPhone={client.contact_phone}
          additionalContacts={parsedAdditionalContacts}
        />

        <AdditionalInfoCard 
          industry={client.industry}
          website={client.website}
          notes={client.notes}
          background={client.background}
        />
      </div>
    </div>
  );
};