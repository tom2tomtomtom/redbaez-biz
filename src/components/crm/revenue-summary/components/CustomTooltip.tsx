import { TooltipProps } from 'recharts';
import { MonthlyData } from '../types';

export const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload as MonthlyData;
    
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border">
        <p className="font-semibold mb-4">{label}</p>
        
        {/* Actual Revenue Section */}
        <div className="mb-4">
          <p className="font-medium text-sm mb-2">Actual Revenue: ${data.actual.toLocaleString()}</p>
          <div className="space-y-2">
            {data.actualClients && data.actualClients.length > 0 ? (
              data.actualClients
                .sort((a, b) => b.amount - a.amount)
                .map((client, index) => (
                  <div key={`actual-${index}`} className="flex justify-between gap-4">
                    <span className="text-sm">{client.name}</span>
                    <span className="text-sm font-medium">
                      ${client.amount.toLocaleString()}
                    </span>
                  </div>
                ))
            ) : (
              <div className="text-sm text-gray-500">No actual revenue for this period</div>
            )}
          </div>
        </div>

        {/* Forecast Revenue Section */}
        <div>
          <p className="font-medium text-sm mb-2">Forecast Revenue: ${data.forecast.toLocaleString()}</p>
          <div className="space-y-2">
            {data.forecastClients && data.forecastClients.length > 0 ? (
              data.forecastClients
                .sort((a, b) => b.amount - a.amount)
                .map((client, index) => (
                  <div key={`forecast-${index}`} className="flex justify-between gap-4">
                    <span className="text-sm">{client.name}</span>
                    <span className="text-sm font-medium">
                      ${client.amount.toLocaleString()}
                    </span>
                  </div>
                ))
            ) : (
              <div className="text-sm text-gray-500">No forecast revenue for this period</div>
            )}
          </div>
        </div>
      </div>
    );
  }
  return null;
};