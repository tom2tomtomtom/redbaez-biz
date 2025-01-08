import { useState } from 'react';
import { useClientForecasts } from '@/hooks/useClientForecasts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ForecastEditorProps {
  clientId: number;
}

export const ForecastEditor = ({ clientId }: ForecastEditorProps) => {
  const { updateForecast } = useClientForecasts(clientId);
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [amount, setAmount] = useState<string>('');
  const [isActual, setIsActual] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    await updateForecast.mutate({
      month: selectedMonth + '-01', // Add day to make it a valid date string
      amount: parseFloat(amount),
      isActual
    });

    setAmount('');
    setIsActual(false);
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Monthly Revenue Editor</h3>
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
            placeholder="Revenue amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={isActual}
            onCheckedChange={setIsActual}
            id="actual-revenue"
          />
          <Label htmlFor="actual-revenue">Mark as Actual Revenue</Label>
        </div>
        <Button 
          type="submit" 
          disabled={updateForecast.isPending}
          className="w-full"
        >
          {updateForecast.isPending ? 'Updating...' : 'Update Revenue'}
        </Button>
      </form>
    </Card>
  );
};