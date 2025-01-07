import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface KeyMetricsCardProps {
  annualRevenue: number | null;
  revenueData: Array<{ month: string; value: number }>;
}

export const KeyMetricsCard = ({ annualRevenue, revenueData }: KeyMetricsCardProps) => {
  return (
    <Card className="col-span-12 lg:col-span-4 transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Key Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-primary/5 rounded-lg transition-all duration-300 hover:bg-primary/10">
            <p className="text-sm text-primary font-medium">Annual Revenue</p>
            <p className="text-2xl font-semibold text-primary">
              ${annualRevenue?.toLocaleString() || 'N/A'}
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
  );
};