import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useClientForecasts } from '@/hooks/useClientForecasts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQueryClient } from '@tanstack/react-query';

interface ForecastEditorProps {
  clientId: number;
}

interface MonthlyValues {
  forecast: number;
  actual: number;
}

type MonthlyData = {
  [key: string]: MonthlyValues;
};

export const ForecastEditor = ({ clientId }: ForecastEditorProps) => {
  const queryClient = useQueryClient();
  const { updateForecast } = useClientForecasts(clientId);
  const [isEditing, setIsEditing] = useState(false);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentYear = new Date().getFullYear();
  
  const [monthlyData, setMonthlyData] = useState<MonthlyData>(() => 
    months.reduce((acc, month) => ({
      ...acc,
      [month.toLowerCase()]: {
        forecast: 0,
        actual: 0
      }
    }), {} as MonthlyData)
  );

  const handleValueChange = (month: string, type: 'forecast' | 'actual', value: string) => {
    const numericValue = value === '' ? 0 : parseInt(value, 10);
    setMonthlyData(prev => ({
      ...prev,
      [month.toLowerCase()]: {
        ...prev[month.toLowerCase()],
        [type]: numericValue
      }
    }));
  };

  const handleSubmit = async () => {
    try {
      for (const [month, values] of Object.entries(monthlyData)) {
        const monthDate = new Date(`${currentYear}-${months.findIndex(m => m.toLowerCase() === month) + 1}-01`);
        
        await updateForecast.mutate({
          month: format(monthDate, 'yyyy-MM-dd'),
          amount: Math.round(values.forecast),
          isActual: false
        });

        await updateForecast.mutate({
          month: format(monthDate, 'yyyy-MM-dd'),
          amount: Math.round(values.actual),
          isActual: true
        });
      }

      // Invalidate relevant queries to trigger updates
      queryClient.invalidateQueries({ queryKey: ['monthly-revenue'] });
      queryClient.invalidateQueries({ queryKey: ['client', clientId] });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating revenue:', error);
    }
  };

  if (!isEditing) {
    return (
      <Card className="p-4">
        <Button 
          onClick={() => setIsEditing(true)}
          className="w-full"
        >
          Update Revenue
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Revenue Editor</h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Month</TableHead>
              <TableHead>Forecast ($)</TableHead>
              <TableHead>Actual ($)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {months.map((month) => (
              <TableRow key={month}>
                <TableCell>{month}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={monthlyData[month.toLowerCase()].forecast || ''}
                    onChange={(e) => handleValueChange(month, 'forecast', e.target.value)}
                    className="w-full"
                    placeholder="Enter forecast"
                    min="0"
                    step="1"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={monthlyData[month.toLowerCase()].actual || ''}
                    onChange={(e) => handleValueChange(month, 'actual', e.target.value)}
                    className="w-full"
                    placeholder="Enter actual"
                    min="0"
                    step="1"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4 flex gap-2">
        <Button 
          variant="outline" 
          onClick={() => setIsEditing(false)}
          className="w-full"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          className="w-full"
          disabled={updateForecast.isPending}
        >
          {updateForecast.isPending ? 'Saving...' : 'Save All Changes'}
        </Button>
      </div>
    </Card>
  );
};