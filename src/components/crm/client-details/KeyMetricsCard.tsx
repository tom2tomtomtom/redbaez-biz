import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckCircle2, XCircle } from 'lucide-react';

interface KeyMetricsCardProps {
  annualRevenue: number | null;
  projectRevenue?: number | null;
  likelihood?: number | null;
  revenueData: Array<{ month: string; value: number }>;
  projectRevenueSignedOff?: boolean;
  projectRevenueForecast?: boolean;
  annualRevenueSignedOff?: number | null;
  annualRevenueForecast?: number | null;
}

export const KeyMetricsCard = ({ 
  annualRevenue, 
  projectRevenue, 
  likelihood,
  revenueData,
  projectRevenueSignedOff,
  projectRevenueForecast,
  annualRevenueSignedOff,
  annualRevenueForecast
}: KeyMetricsCardProps) => {
  return (
    <Card className="col-span-12 lg:col-span-4 transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Key Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-primary/5 rounded-lg transition-all duration-300 hover:bg-primary/10">
              <p className="text-sm text-primary font-medium">Annual Revenue</p>
              <p className="text-2xl font-semibold text-primary">
                ${annualRevenue?.toLocaleString() || 'N/A'}
              </p>
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Signed Off:</p>
                  <p className="text-sm font-medium">
                    ${annualRevenueSignedOff?.toLocaleString() || '0'}
                    {annualRevenueSignedOff ? (
                      <span className="ml-2 text-xs text-green-600">(Confirmed)</span>
                    ) : null}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Forecast:</p>
                  <p className="text-sm font-medium">
                    ${annualRevenueForecast?.toLocaleString() || '0'}
                    {annualRevenueForecast ? (
                      <span className="ml-2 text-xs text-blue-600">(Projected)</span>
                    ) : null}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-primary/5 rounded-lg transition-all duration-300 hover:bg-primary/10">
              <p className="text-sm text-primary font-medium">Project Revenue</p>
              <p className="text-2xl font-semibold text-primary">
                ${projectRevenue?.toLocaleString() || 'N/A'}
              </p>
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Signed Off:</span>
                  <div className="flex items-center">
                    {projectRevenueSignedOff ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="ml-1 text-xs text-green-600">Confirmed</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="ml-1 text-xs text-red-600">Pending</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Forecast:</span>
                  <div className="flex items-center">
                    {projectRevenueForecast ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-blue-500" />
                        <span className="ml-1 text-xs text-blue-600">Projected</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-gray-500" />
                        <span className="ml-1 text-xs text-gray-600">Not Set</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-primary/5 rounded-lg transition-all duration-300 hover:bg-primary/10">
            <div className="flex justify-between items-center">
              <p className="text-sm text-primary font-medium">Deal Likelihood</p>
              <span className={`px-2 py-1 rounded-full text-sm ${
                likelihood && likelihood > 70 ? 'bg-green-100 text-green-800' :
                likelihood && likelihood > 30 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {likelihood ? `${likelihood}%` : 'N/A'}
              </span>
            </div>
          </div>

          <div className="h-48">
            <p className="text-sm text-gray-600 mb-2">Monthly Revenue Forecast</p>
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