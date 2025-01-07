import { Card } from '@/components/ui/card';
import { CheckCircle2, XCircle } from 'lucide-react';

interface AnnualRevenueMetricProps {
  annualRevenue: number | null;
  annualRevenueSignedOff?: number | null;
  annualRevenueForecast?: number | null;
}

export const AnnualRevenueMetric = ({
  annualRevenue,
  annualRevenueSignedOff,
  annualRevenueForecast,
}: AnnualRevenueMetricProps) => {
  return (
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
  );
};