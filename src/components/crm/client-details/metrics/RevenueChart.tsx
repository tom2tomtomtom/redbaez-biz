import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit2 } from 'lucide-react';
import { MonthlyForecast } from '../types/MonthlyForecast';

interface RevenueChartProps {
  revenueData: Array<{ month: string; value: number }>;
  monthlyForecasts: MonthlyForecast[];
  isEditing?: boolean;
  onForecastUpdate?: (month: string, amount: number) => void;
}

export const RevenueChart = ({
  revenueData,
  monthlyForecasts,
  isEditing = false,
  onForecastUpdate
}: RevenueChartProps) => {
  const [showTable, setShowTable] = useState(false);
  const [localForecasts, setLocalForecasts] = useState<MonthlyForecast[]>([]);
  const [chartData, setChartData] = useState(revenueData);

  // Initialize local forecasts when monthlyForecasts prop changes
  useEffect(() => {
    console.log('Initializing local forecasts with:', monthlyForecasts);
    const initialForecasts = revenueData.map(item => {
      const existingForecast = monthlyForecasts.find(f => f.month === item.month);
      return {
        month: item.month,
        amount: existingForecast ? existingForecast.amount : 0
      };
    });
    setLocalForecasts(initialForecasts);
    updateChartData(initialForecasts);
  }, [monthlyForecasts, revenueData]);

  const updateChartData = (forecasts: MonthlyForecast[]) => {
    const newChartData = revenueData.map(item => {
      const forecast = forecasts.find(f => f.month === item.month);
      return {
        month: item.month,
        value: item.value,
        forecast: forecast ? forecast.amount : 0
      };
    });
    setChartData(newChartData);
  };

  const handleForecastChange = (month: string, value: string) => {
    const numericValue = value === '' ? 0 : Number(value);
    
    if (!isNaN(numericValue)) {
      console.log('Updating local forecast for month:', month, 'with value:', numericValue);
      
      const updatedForecasts = localForecasts.map(f => 
        f.month === month ? { ...f, amount: numericValue } : f
      );
      
      setLocalForecasts(updatedForecasts);
      updateChartData(updatedForecasts);
      
      // Immediately notify parent of changes
      if (onForecastUpdate) {
        onForecastUpdate(month, numericValue);
      }
    }
  };

  // Calculate total annual revenue from monthly forecasts
  const calculateAnnualRevenue = () => {
    return localForecasts.reduce((total, forecast) => total + (forecast.amount || 0), 0);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600">Monthly Revenue & Forecast</p>
          <p className="text-sm text-gray-600">Annual Total: ${calculateAnnualRevenue().toLocaleString()}</p>
        </div>
        {isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTable(!showTable)}
            className="flex items-center gap-2"
          >
            <Edit2 className="h-4 w-4" />
            {showTable ? 'Show Chart' : 'Edit Forecasts'}
          </Button>
        )}
      </div>

      {showTable && isEditing ? (
        <div className="border rounded-lg overflow-hidden">
          <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50">
            {revenueData.map((item) => {
              const forecast = localForecasts.find(f => f.month === item.month);
              return (
                <div key={item.month} className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {item.month}
                  </label>
                  <Input
                    type="number"
                    value={forecast ? forecast.amount : 0}
                    onChange={(e) => handleForecastChange(item.month, e.target.value)}
                    className="w-full"
                    placeholder="Enter forecast"
                  />
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar 
                dataKey="value" 
                fill="hsl(var(--primary))" 
                name="Actual"
              />
              <Bar 
                dataKey="forecast" 
                fill="hsl(var(--primary)/0.5)" 
                name="Forecast"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};