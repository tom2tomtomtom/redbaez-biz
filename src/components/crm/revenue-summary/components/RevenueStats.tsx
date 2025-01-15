import { AnnualTotals } from '../types';

interface RevenueStatsProps {
  annualTotals: AnnualTotals;
}

export const RevenueStats = ({ annualTotals }: RevenueStatsProps) => {
  const totalAnnualRevenue = annualTotals.confirmed + annualTotals.forecast;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">Total Annual Revenue</p>
        <p className="text-2xl font-bold">${totalAnnualRevenue.toLocaleString()}</p>
      </div>
      <div className="p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-600">Confirmed Revenue</p>
        <p className="text-2xl font-bold text-blue-600">
          ${annualTotals.confirmed.toLocaleString()}
        </p>
      </div>
      <div className="p-4 bg-green-50 rounded-lg">
        <p className="text-sm text-green-600">Forecast Revenue</p>
        <p className="text-2xl font-bold text-green-600">
          ${annualTotals.forecast.toLocaleString()}
        </p>
      </div>
    </div>
  );
};