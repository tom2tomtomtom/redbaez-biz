import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { RevenueStats } from './components/RevenueStats';
import { RevenueChart } from './components/RevenueChart';
import { RevenueData } from './types';

const fetchMonthlyRevenue = async () => {
  const { data: clients, error } = await supabase
    .from('clients')
    .select('*');
    
  if (error) throw error;

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

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

  const annualTotals = clients.reduce((acc: any, client: any) => {
    return {
      confirmed: acc.confirmed + (client.annual_revenue_signed_off || 0),
      forecast: acc.forecast + (client.annual_revenue_forecast || 0)
    };
  }, { confirmed: 0, forecast: 0 });

  return {
    monthlyData,
    annualTotals
  };
};

export const RevenueSummary = () => {
  const { data, isLoading, error } = useQuery<RevenueData>({
    queryKey: ['monthly-revenue'],
    queryFn: fetchMonthlyRevenue,
  });

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
        <RevenueChart monthlyData={data.monthlyData} />
      </CardContent>
    </Card>
  );
};