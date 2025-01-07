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
    <div className="p-4 bg-blue-50/50 rounded-lg transition-all duration-300 hover:bg-blue-50">
      <p className="text-lg text-blue-600 font-medium">Annual Revenue</p>
      <p className="text-3xl font-bold text-blue-600 mb-4">
        ${annualRevenue?.toLocaleString() || '0'}
      </p>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-gray-600">Signed Off:</p>
          <div className="flex items-center gap-2">
            <span className="font-medium">
              ${annualRevenueSignedOff?.toLocaleString() || '0'}
            </span>
            {annualRevenueSignedOff && annualRevenueSignedOff > 0 ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm text-gray-500">
              {annualRevenueSignedOff && annualRevenueSignedOff > 0 ? 'Confirmed' : 'Pending'}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-gray-600">Forecast:</p>
          <div className="flex items-center gap-2">
            <span className="font-medium">
              ${annualRevenueForecast?.toLocaleString() || '0'}
            </span>
            {annualRevenueForecast && annualRevenueForecast > 0 ? (
              <CheckCircle2 className="h-4 w-4 text-blue-500" />
            ) : (
              <XCircle className="h-4 w-4 text-gray-500" />
            )}
            <span className="text-sm text-gray-500">
              {annualRevenueForecast && annualRevenueForecast > 0 ? 'Projected' : 'Not Set'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};