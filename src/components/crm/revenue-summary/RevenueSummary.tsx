import logger from '@/utils/logger';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient'; 
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { RevenueStats } from './components/RevenueStats';
import { RevenueChart } from './components/RevenueChart';
import { RevenueData, MonthlyData } from './types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RevenueEditor } from './components/RevenueEditor';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';

const fetchMonthlyRevenue = async () => {
  logger.info('Starting fetchMonthlyRevenue function...');
  
  const { data: clients, error } = await supabase
    .from('clients')
    .select('*');
    
  if (error) {
    logger.error('Error fetching clients for revenue data:', error);
    throw error;
  }

  logger.info(`Fetched ${clients?.length || 0} clients for revenue calculations`);

  // If no clients found, return empty data
  if (!clients || clients.length === 0) {
    logger.info('No clients found for revenue calculations');
    return {
      monthlyData: [],
      annualTotals: { confirmed: 0, forecast: 0 },
      clients: []
    };
  }

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Debug each client's revenue data
  clients.forEach((client, index) => {
    if (index < 3) { // Only log first 3 clients to avoid flooding console
      logger.info(`Client ${client.id} (${client.name}) revenue data:`, {
        annual_revenue_signed_off: client.annual_revenue_signed_off,
        annual_revenue_forecast: client.annual_revenue_forecast,
        sample_monthly: {
          actual_jan: client.actual_jan,
          forecast_jan: client.forecast_jan
        }
      });
    }
  });

  const monthlyData = months.map(month => {
    const monthLower = month.toLowerCase();
    
    const actualClients = clients
      .filter(client => client[`actual_${monthLower}`] > 0)
      .map(client => ({
        name: client.name,
        amount: client[`actual_${monthLower}`] || 0,
        type: 'actual' as const
      }));

    const forecastClients = clients
      .filter(client => client[`forecast_${monthLower}`] > 0)
      .map(client => ({
        name: client.name,
        amount: client[`forecast_${monthLower}`] || 0,
        type: 'forecast' as const
      }));

    const actual = actualClients.reduce((sum, client) => sum + client.amount, 0);
    const forecast = forecastClients.reduce((sum, client) => sum + client.amount, 0);

    return {
      month,
      actual: Math.round(actual),
      forecast: Math.round(forecast),
      actualClients,
      forecastClients
    };
  });

  // Log the monthly data we've calculated
  logger.info('Calculated monthly revenue data:', monthlyData.map(m => ({
    month: m.month,
    actual: m.actual,
    forecast: m.forecast,
    actualClientCount: m.actualClients.length,
    forecastClientCount: m.forecastClients.length
  })));

  const annualTotals = clients.reduce((acc, client) => {
    // Use Number() to ensure we're working with numbers, defaulting to 0 for null/undefined
    const confirmed = Number(client.annual_revenue_signed_off) || 0;
    const forecast = Number(client.annual_revenue_forecast) || 0;
    
    return {
      confirmed: acc.confirmed + confirmed,
      forecast: acc.forecast + forecast
    };
  }, { confirmed: 0, forecast: 0 });

  logger.info('Calculated annual totals:', annualTotals);

  return {
    monthlyData,
    annualTotals,
    clients
  };
};

export const RevenueSummary = () => {
  const queryClient = useQueryClient();
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedClients, setSelectedClients] = useState<any[]>([]);
  const [revenueType, setRevenueType] = useState<'actual' | 'forecast'>('actual');
  
  const { data, isLoading, error, refetch } = useQuery<RevenueData>({
    queryKey: ['monthly-revenue'],
    queryFn: fetchMonthlyRevenue,
    staleTime: 0, // Always refetch when requested
    refetchOnWindowFocus: true // Refetch when window regains focus
  });

  // Add a log whenever data changes to see what's being returned from the query
  logger.info('RevenueSummary received data from query:', {
    hasData: !!data,
    monthlyDataLength: data?.monthlyData?.length || 0,
    annualTotals: data?.annualTotals,
  });

  const handleRefresh = async () => {
    logger.info('Manually refreshing revenue data...');
    toast({
      title: "Refreshing data",
      description: "Updating revenue information..."
    });
    
    // Clear cached data to force a fresh fetch
    queryClient.removeQueries({ queryKey: ['monthly-revenue'] });
    
    // Trigger a refetch
    await refetch();
    
    toast({
      title: "Refresh complete",
      description: "Revenue data has been updated"
    });
  };

  const handleBarClick = (month: string, type: 'actual' | 'forecast') => {
    if (!data?.clients) return;
    
    setSelectedMonth(month);
    setRevenueType(type);
    setSelectedClients(data.clients);
    setIsEditDialogOpen(true);
  };

  const handleSaveChanges = async (updatedClients: any[]) => {
    if (!selectedMonth) return;
    
    const monthName = selectedMonth.toLowerCase();
    const columnPrefix = revenueType === 'actual' ? 'actual' : 'forecast';
    const columnName = `${columnPrefix}_${monthName}`;
    
    const promises = updatedClients.map(async (client) => {
      // Update the specific monthly column
      const { error: updateError } = await supabase
        .from('clients')
        .update({ [columnName]: client.amount })
        .eq('id', client.id);
      
      if (updateError) {
        logger.error(`Error updating client ${client.id}:`, updateError);
        throw updateError;
      }
      
      // Also update the annual totals
      const { data: updatedClient, error: fetchError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', client.id)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Calculate new totals
      const totalForecast = Object.entries(updatedClient)
        .filter(([key]) => key.startsWith('forecast_'))
        .reduce((sum, [_, value]) => sum + (Number(value) || 0), 0);
      
      const totalActual = Object.entries(updatedClient)
        .filter(([key]) => key.startsWith('actual_'))
        .reduce((sum, [_, value]) => sum + (Number(value) || 0), 0);
      
      // Update the annual totals
      const { error: totalUpdateError } = await supabase
        .from('clients')
        .update({
          annual_revenue_forecast: totalForecast,
          annual_revenue_signed_off: totalActual
        })
        .eq('id', client.id);
      
      if (totalUpdateError) throw totalUpdateError;
      
      return client;
    });
    
    try {
      await Promise.all(promises);
      
      // Immediately clear stale data
      queryClient.removeQueries({ queryKey: ['monthly-revenue'] });
      queryClient.removeQueries({ queryKey: ['clients'] });
      
      // Force refetch of necessary data
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['monthly-revenue'] }),
        queryClient.refetchQueries({ queryKey: ['clients'] })
      ]);
      
      toast({
        title: "Success",
        description: `${selectedMonth} revenue updated successfully`,
      });
      
      setIsEditDialogOpen(false);
    } catch (error) {
      logger.error('Error updating revenue:', error);
      toast({
        title: "Error",
        description: "Failed to update revenue",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Revenue Overview</CardTitle>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Revenue Overview</CardTitle>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">Error loading revenue data: {error.message}</div>
        </CardContent>
      </Card>
    );
  }

  // Initialize empty data if null/undefined
  const safeData = {
    monthlyData: data?.monthlyData || [],
    annualTotals: data?.annualTotals || { confirmed: 0, forecast: 0 },
    clients: data?.clients || []
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Revenue Overview</CardTitle>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-8">
          <RevenueStats annualTotals={safeData.annualTotals} />
        </div>
        <RevenueChart 
          monthlyData={safeData.monthlyData} 
          onBarClick={handleBarClick}
        />

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Edit {revenueType === 'actual' ? 'Actual' : 'Forecast'} Revenue for {selectedMonth}
              </DialogTitle>
            </DialogHeader>
            {selectedMonth && (
              <RevenueEditor 
                clients={selectedClients}
                month={selectedMonth}
                type={revenueType}
                onSave={handleSaveChanges}
                onCancel={() => setIsEditDialogOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
