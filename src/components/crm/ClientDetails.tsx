import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { KeyMetricsCard } from '@/components/crm/client-details/KeyMetricsCard';
import { ContactInfoCard, Contact } from '@/components/crm/client-details/ContactInfoCard';
import { AdditionalInfoCard } from '@/components/crm/client-details/AdditionalInfoCard';
import { useClientUpdate } from '@/components/crm/client-details/useClientUpdate';
import { useClientInitialization } from '@/components/crm/client-details/useClientInitialization';
import { ClientHeader } from '@/components/crm/client-details/ClientHeader';
import { ClientEditMode } from '@/components/crm/client-details/ClientEditMode';
import { MonthlyForecast } from '@/components/crm/client-details/types/MonthlyForecast';

export const ClientDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [nextSteps, setNextSteps] = useState('');
  const [nextDueDate, setNextDueDate] = useState('');

  // Validate id parameter
  if (!id || isNaN(Number(id))) {
    console.error('Invalid client ID:', id);
    return <Navigate to="/" replace />;
  }

  const { data: client, isLoading, error } = useQuery({
    queryKey: ['client', id],
    queryFn: async () => {
      console.log('Fetching client data for ID:', id);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error('Client not found');
      
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

  // Generate monthly revenue data including forecasts
  const revenueData = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(new Date().getFullYear(), new Date().getMonth() + i);
    const month = date.toLocaleString('default', { month: 'short' });
    return {
      month,
      value: client.annual_revenue ? client.annual_revenue / 12 : 0
    };
  });

  // Parse monthly forecasts from client data with type checking
  const monthlyForecasts: MonthlyForecast[] = Array.isArray(client.monthly_revenue_forecasts) 
    ? client.monthly_revenue_forecasts.map((forecast: any) => ({
        month: String(forecast.month),
        amount: Number(forecast.amount)
      }))
    : [];

  const handleForecastUpdate = async (forecasts: MonthlyForecast[]) => {
    console.log('Updating forecasts:', forecasts);
    updateMutation.mutate({ 
      formData: { ...client, monthly_revenue_forecasts: forecasts },
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
        onMonthlyForecastsChange={handleForecastUpdate}
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
          projectRevenueSignedOff={client.project_revenue_signed_off}
          projectRevenueForecast={client.project_revenue_forecast}
          annualRevenueSignedOff={client.annual_revenue_signed_off}
          annualRevenueForecast={client.annual_revenue_forecast}
          monthlyForecasts={monthlyForecasts}
          isEditing={isEditing}
          onForecastUpdate={handleForecastUpdate}
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
