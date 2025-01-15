import { TooltipProps } from 'recharts';
import { MonthlyData } from '../types';

export const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
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