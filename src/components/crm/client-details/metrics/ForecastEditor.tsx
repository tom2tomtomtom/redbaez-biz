import { useState } from 'react';
import { useClientForecasts } from '@/hooks/useClientForecasts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';

interface ForecastEditorProps {
  clientId: number;
}

export const ForecastEditor = ({ clientId }: ForecastEditorProps) => {
  const { forecasts, updateForecast } = useClientForecasts(clientId);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [amount, setAmount] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    await updateForecast.mutate({
      month: selectedMonth,
      amount: parseFloat(amount)
    });

    setAmount('');
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Monthly Forecast Editor</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="month"
            value={format(selectedMonth, 'yyyy-MM')}
            onChange={(e) => setSelectedMonth(new Date(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <Input
            type="number"
            placeholder="Forecast amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full"
          />
        </div>
        <Button 
          type="submit" 
          disabled={updateForecast.isPending}
          className="w-full"
        >
          {updateForecast.isPending ? 'Updating...' : 'Update Forecast'}
        </Button>
      </form>

      <div className="mt-4">
        <h4 className="font-medium mb-2">Current Forecasts</h4>
        <div className="space-y-2">
          {forecasts?.map((forecast) => (
            <div key={forecast.id} className="flex justify-between items-center">
              <span>{format(new Date(forecast.month), 'MMMM yyyy')}</span>
              <span>${forecast.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};