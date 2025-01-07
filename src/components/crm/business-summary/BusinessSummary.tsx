import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

const fetchClients = async () => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
};

const getLikelihoodColor = (likelihood: number | null) => {
  const score = likelihood || 0;
  if (score >= 75) return 'bg-green-100 text-green-800';
  if (score >= 50) return 'bg-yellow-100 text-yellow-800';
  if (score >= 25) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
};

export const BusinessSummary = () => {
  const [open, setOpen] = useState(false);
  const { data: clients, isLoading, error } = useQuery({
    queryKey: ['clients'],
    queryFn: fetchClients,
  });

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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Likelihood</TableHead>
            <TableHead>Industry</TableHead>
            <TableHead>Type</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell className="font-medium">{client.name}</TableCell>
              <TableCell>{client.status || 'N/A'}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-sm ${getLikelihoodColor(client.likelihood)}`}>
                  {client.likelihood || '0'}%
                </span>
              </TableCell>
              <TableCell>{client.industry || 'N/A'}</TableCell>
              <TableCell>{client.type}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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