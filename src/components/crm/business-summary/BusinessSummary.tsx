import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { RevenueCharts } from './components/RevenueCharts';
import { ClientsTable } from './components/ClientsTable';
import { calculateRevenueData } from './utils/revenueCalculations';

const fetchClients = async () => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
};

export const BusinessSummary = () => {
  const [open, setOpen] = useState(false);
  const { data: clients, isLoading, error } = useQuery({
    queryKey: ['clients'],
    queryFn: fetchClients,
  });

  const { forecastData, achievedData } = clients ? calculateRevenueData(clients) : { forecastData: [], achievedData: [] };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4 text-red-500">
          Error loading clients
        </div>
      );
    }

    if (!clients?.length) {
      return (
        <div className="p-4 text-gray-500 text-center">
          No clients found
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <RevenueCharts forecastData={forecastData} achievedData={achievedData} />
        <ClientsTable clients={clients} />
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          Business Summary
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Business Summary</DialogTitle>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};