import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Calendar, Mail, Phone, Star, Edit, MoreHorizontal, Plus, ArrowLeft, Save, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { ClientForm } from './client-form/ClientForm';

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
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedData: any) => {
      const { error } = await supabase
        .from('clients')
        .update(updatedData)
        .eq('id', id);
      
      if (error) throw error;
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
    updateMutation.mutate(formData);
  };

  // Sample revenue data - in a real app, this would come from a separate table
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
    <div className="flex flex-col space-y-6 p-8 w-full max-w-7xl mx-auto bg-gray-50/50 animate-fade-in">
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
        <Card className="col-span-12 lg:col-span-4 transition-all duration-300 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Key Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-primary/5 rounded-lg transition-all duration-300 hover:bg-primary/10">
                <p className="text-sm text-primary font-medium">Annual Revenue</p>
                <p className="text-2xl font-semibold text-primary">
                  ${client.annual_revenue?.toLocaleString() || 'N/A'}
                </p>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-12 lg:col-span-8 transition-all duration-300 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-medium">Contact Information</CardTitle>
            <Button variant="outline" size="sm" className="transition-all duration-300">
              <Plus className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-100 rounded-lg hover:border-primary/20 hover:shadow-sm transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{client.contact_name || 'No contact name'}</h3>
                    <p className="text-sm text-gray-500">{client.company_size || 'Company size not specified'}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="transition-all duration-300">
                    <Star size={16} />
                  </Button>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail size={14} className="mr-2" />
                    {client.contact_email || 'No email provided'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone size={14} className="mr-2" />
                    {client.contact_phone || 'No phone provided'}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-12 transition-all duration-300 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-medium">Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Industry</p>
                  <p className="mt-1">{client.industry || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Website</p>
                  <p className="mt-1">
                    {client.website ? (
                      <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {client.website}
                      </a>
                    ) : 'Not specified'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-500">Notes</p>
                  <p className="mt-1">{client.notes || 'No notes available'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};