import logger from '@/utils/logger';

import { AnnualTotals } from '../types';

interface RevenueStatsProps {
  annualTotals: AnnualTotals;
}

export const RevenueStats = ({ annualTotals }: RevenueStatsProps) => {
  logger.info('RevenueStats rendering with annual totals:', annualTotals);
  
  // Ensure we have numbers to work with
  const confirmed = Number(annualTotals?.confirmed || 0);
  const forecast = Number(annualTotals?.forecast || 0);
  const totalAnnualRevenue = confirmed + forecast;

  logger.info('RevenueStats calculated values:', {
    confirmed,
    forecast,
    totalAnnualRevenue
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">Total Annual Revenue</p>
        <p className="text-2xl font-bold">${totalAnnualRevenue.toLocaleString()}</p>
      </div>
      <div className="p-4 bg-[#1A1F2C] rounded-lg">
        <p className="text-sm text-white">Actual Revenue</p>
        <p className="text-2xl font-bold text-white">
          ${confirmed.toLocaleString()}
        </p>
      </div>
      <div className="p-4 bg-[hsl(var(--primary)/0.1)] rounded-lg">
        <p className="text-sm text-primary">Forecast Revenue</p>
        <p className="text-2xl font-bold text-primary">
          ${forecast.toLocaleString()}
        </p>
      </div>
    </div>
  );
};
