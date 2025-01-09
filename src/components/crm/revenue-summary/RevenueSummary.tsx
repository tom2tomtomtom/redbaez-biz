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

  // Calculate annual totals
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
  const { data, isLoading, error } = useQuery({
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

  const { monthlyData, annualTotals } = data;
  const totalAnnualRevenue = annualTotals.confirmed + annualTotals.forecast;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Annual Revenue</p>
              <p className="text-2xl font-bold">${totalAnnualRevenue.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600">Confirmed Revenue</p>
              <p className="text-2xl font-bold text-blue-600">
                ${annualTotals.confirmed.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600">Forecast Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                ${annualTotals.forecast.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
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