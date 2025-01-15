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
  TooltipProps,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ClientDetail {
  name: string;
  amount: number;
  type: 'actual' | 'forecast';
}

interface MonthlyData {
  month: string;
  actual: number;
  forecast: number;
  actualClients: ClientDetail[];
  forecastClients: ClientDetail[];
}

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

  // Calculate total actual and forecast revenue for each month with client details
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
      .filter(client => client[`actual_${monthLower}`] === 0 && client[`forecast_${monthLower}`] > 0)
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

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length > 0) {
    const dataKey = payload[0].dataKey as 'actual' | 'forecast';
    const data = payload[0].payload as MonthlyData;
    const clients = dataKey === 'actual' ? data.actualClients : data.forecastClients;

    const title = dataKey === 'actual' ? 'Actual Revenue' : 'Forecast Revenue';

    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border">
        <p className="font-semibold mb-2">{label} - {title}</p>
        <div className="space-y-2">
          {clients && clients.length > 0 ? (
            clients
              .sort((a, b) => b.amount - a.amount)
              .map((client, index) => (
                <div key={index} className="flex justify-between gap-4">
                  <span className="text-sm">{client.name}</span>
                  <span className="text-sm font-medium">
                    ${client.amount.toLocaleString()}
                  </span>
                </div>
              ))
          ) : (
            <div className="text-sm text-gray-500">No clients for this period</div>
          )}
        </div>
      </div>
    );
  }
  return null;
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

  // Add null check for data
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
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="actual" fill="#1A1F2C" name="Actual Revenue" />
              <Bar dataKey="forecast" fill="hsl(var(--primary)/0.5)" name="Forecast Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};