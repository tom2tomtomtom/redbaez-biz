import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, MoreHorizontal, ArrowLeft, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { ClientForm } from './client-form/ClientForm';
import { KeyMetricsCard } from './client-details/KeyMetricsCard';
import { ContactInfoCard } from './client-details/ContactInfoCard';
import { AdditionalInfoCard } from './client-details/AdditionalInfoCard';

export const ClientDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [contacts, setContacts] = useState([{ 
    firstName: '', 
    lastName: '', 
    title: '', 
    email: '', 
    address: '', 
    phone: '' 
  }]);
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

      if (data) {
        console.log('Received client data:', data);
        const [firstName = '', lastName = ''] = (data.contact_name || '').split(' ');
        setContacts([{
          firstName,
          lastName,
          title: '',
          email: data.contact_email || '',
          address: '',
          phone: data.contact_phone || ''
        }]);
        setNextSteps(data.notes || '');
        setNextDueDate(data.next_due_date || '');
      }
      
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedData: any) => {
      // Log the data being sent to the update
      console.log('Updating client with data:', updatedData);
      
      const { data, error } = await supabase
        .from('clients')
        .update(updatedData)
        .eq('id', id)
        .select();
      
      if (error) {
        console.error('Error updating client:', error);
        throw error;
      }
      
      console.log('Update response:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', id] });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Client information updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update client information",
        variant: "destructive",
      });
      console.error('Error updating client:', error);
    },
  });

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
    // Get the primary contact from the contacts array
    const primaryContact = contacts[0] || {
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    };

    console.log('Primary contact for update:', primaryContact);

    // Prepare the update data with contact information
    const updateData = {
      ...formData,
      contact_name: `${primaryContact.firstName} ${primaryContact.lastName}`.trim(),
      contact_email: primaryContact.email,
      contact_phone: primaryContact.phone,
    };

    console.log('Saving client with data:', updateData);
    updateMutation.mutate(updateData);
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
      <div className="p-8 w-full max-w-7xl mx-auto bg-gray-50/50">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="ghost"
            className="flex items-center gap-2"
            onClick={() => setIsEditing(false)}
          >
            <X size={16} />
            Cancel Editing
          </Button>
        </div>
        <ClientForm
          initialData={client}
          onSave={handleSave}
          isEditing={true}
          contacts={contacts}
          nextSteps={nextSteps}
          nextDueDate={nextDueDate}
          onContactsChange={setContacts}
          onNextStepsChange={setNextSteps}
          onNextDueDateChange={setNextDueDate}
        />
      </div>
    );
  }

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

      <div className="flex flex-col md:flex-row justify-between items-start bg-white p-6 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md">
        <div>
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-semibold text-gray-800">{client.name}</h1>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              {client.status || 'New Client'}
            </span>
          </div>
          <p className="text-gray-500 mt-1">Client since {new Date(client.created_at).getFullYear()} · ID: {client.id}</p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <Button 
            variant="outline" 
            className="flex items-center gap-2 transition-all duration-300"
            onClick={() => setIsEditing(true)}
          >
            <Edit size={16} />
            Edit
          </Button>
          <Button variant="outline" className="flex items-center gap-2 transition-all duration-300">
            <MoreHorizontal size={16} />
          </Button>
        </div>
      </div>

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