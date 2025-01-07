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
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';

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

const calculateRevenueData = (clients: any[]) => {
  const forecastData = [];
  const achievedData = [];
  
  // Group by month
  const monthlyData = clients.reduce((acc: any, client: any) => {
    const date = new Date(client.created_at);
    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
    
    if (!acc[monthYear]) {
      acc[monthYear] = {
        forecast: 0,
        achieved: 0
      };
    }
    
    // Sum up forecast revenue (annual_revenue * likelihood)
    if (client.annual_revenue && client.likelihood) {
      acc[monthYear].forecast += (client.annual_revenue * (client.likelihood / 100));
    }
    
    // Sum up achieved revenue (for clients with status = 'customer')
    if (client.status === 'customer' && client.annual_revenue) {
      acc[monthYear].achieved += client.annual_revenue;
    }
    
    return acc;
  }, {});
  
  // Convert to array format for charts
  Object.entries(monthlyData).forEach(([month, data]: [string, any]) => {
    forecastData.push({
      month,
      revenue: Math.round(data.forecast)
    });
    
    achievedData.push({
      month,
      revenue: Math.round(data.achieved)
    });
  });
  
  return { forecastData, achievedData };
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Revenue Forecast Chart */}
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Revenue Forecast</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Achieved Revenue Chart */}
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Achieved Revenue</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={achievedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

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