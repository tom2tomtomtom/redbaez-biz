import { useState } from 'react';
import { useClientForecasts } from '@/hooks/useClientForecasts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';

interface ForecastEditorProps {
  clientId: number;
}

export const ForecastEditor = ({ clientId }: ForecastEditorProps) => {
  const { forecasts, updateForecast, totalForecast } = useClientForecasts(clientId);
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [amount, setAmount] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    await updateForecast.mutate({
      month: selectedMonth + '-01', // Add day to make it a valid date string
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
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
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
              <span>{format(parseISO(forecast.month), 'MMMM yyyy')}</span>
              <span>${forecast.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center font-semibold">
            <span>Total Annual Forecast:</span>
            <span>${totalForecast.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};