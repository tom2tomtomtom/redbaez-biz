
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client'; // Updated import path
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { RevenueStats } from './components/RevenueStats';
import { RevenueChart } from './components/RevenueChart';
import { RevenueData, MonthlyData } from './types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RevenueEditor } from './components/RevenueEditor';
import { toast } from '@/components/ui/use-toast';

const fetchMonthlyRevenue = async () => {
  console.log('Starting fetchMonthlyRevenue function...');
  
  const { data: clients, error } = await supabase
    .from('clients')
    .select('*');
    
  if (error) {
    console.error('Error fetching clients for revenue data:', error);
    throw error;
  }

  console.log(`Fetched ${clients?.length || 0} clients for revenue calculations`);

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Debug each client's revenue data
  clients.forEach((client, index) => {
    if (index < 3) { // Only log first 3 clients to avoid flooding console
      console.log(`Client ${client.id} (${client.name}) revenue data:`, {
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
  console.log('Calculated monthly revenue data:', monthlyData.map(m => ({
    month: m.month,
    actual: m.actual,
    forecast: m.forecast,
    actualClientCount: m.actualClients.length,
    forecastClientCount: m.forecastClients.length
  })));  // Fixed extra parenthesis

  const annualTotals = clients.reduce((acc: any, client: any) => {
    // Use Number() to ensure we're working with numbers, defaulting to 0 for null/undefined
    const confirmed = Number(client.annual_revenue_signed_off) || 0;
    const forecast = Number(client.annual_revenue_forecast) || 0;
    
    return {
      confirmed: acc.confirmed + confirmed,
      forecast: acc.forecast + forecast
    };
  }, { confirmed: 0, forecast: 0 });

  console.log('Calculated annual totals:', annualTotals);

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
  
  const { data, isLoading, error } = useQuery<RevenueData>({
    queryKey: ['monthly-revenue'],
    queryFn: fetchMonthlyRevenue
  });

  // Add a log whenever data changes to see what's being returned from the query
  console.log('RevenueSummary received data from query:', {
    hasData: !!data,
    monthlyDataLength: data?.monthlyData?.length || 0,
    annualTotals: data?.annualTotals,
  });

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
        console.error(`Error updating client ${client.id}:`, updateError);
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
      queryClient.invalidateQueries({ queryKey: ['monthly-revenue'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      
      toast({
        title: "Success",
        description: `${selectedMonth} revenue updated successfully`,
      });
      
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating revenue:', error);
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
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
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
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">Error loading revenue data</div>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.monthlyData || !data.annualTotals) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-yellow-500">No revenue data available</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-8">
          <RevenueStats annualTotals={data.annualTotals} />
        </div>
        <RevenueChart 
          monthlyData={data.monthlyData} 
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
