import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const fetchMonthlyRevenue = async () => {
  const { data: clients, error } = await supabase
    .from('clients')
    .select('*');
    
  if (error) throw error;

  // Get all months from Jan to Dec
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Calculate total actual and forecast revenue for each month
  const monthlyData = months.map(month => {
    const monthLower = month.toLowerCase();
    
    const totals = clients.reduce((acc: any, client: any) => {
      const actualKey = `actual_${monthLower}`;
      const forecastKey = `forecast_${monthLower}`;
      
      const actual = client[actualKey] || 0;
      // Only count forecast if there's no actual revenue
      const forecast = actual > 0 ? 0 : (client[forecastKey] || 0);
      
      return {
        actual: acc.actual + actual,
        forecast: acc.forecast + forecast
      };
    }, { actual: 0, forecast: 0 });

    return {
      month,
      actual: Math.round(totals.actual),
      forecast: Math.round(totals.forecast)
    };
  });

  return monthlyData;
};

export const RevenueSummary = () => {
  const { data: revenueData, isLoading, error } = useQuery({
    queryKey: ['monthly-revenue'],
    queryFn: fetchMonthlyRevenue,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue</CardTitle>
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
          <CardTitle>Monthly Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">Error loading revenue data</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Revenue</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="actual" fill="#1A1F2C" name="Actual Revenue" />
              <Bar dataKey="forecast" fill="hsl(var(--primary)/0.5)" name="Forecast Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};