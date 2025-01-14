import React from 'react';

interface AnnualRevenueMetricProps {
  annualRevenue: number | null;
  annualRevenueSignedOff: number;
  annualRevenueForecast: number;
}

export const AnnualRevenueMetric = ({
  annualRevenue,
  annualRevenueSignedOff,
  annualRevenueForecast,
}: AnnualRevenueMetricProps) => {
  const totalRevenue = (annualRevenueSignedOff || 0) + (annualRevenueForecast || 0);

  return (
    <div className="p-4 bg-blue-50/50 rounded-lg transition-all duration-300 hover:bg-blue-50">
      <p className="text-lg text-blue-600 font-medium">Annual Revenue</p>
      <p className="text-3xl font-bold text-blue-600">
        ${totalRevenue.toLocaleString()}
      </p>
      <div className="space-y-1">
        <p className="text-sm text-blue-500">
          Actual: ${(annualRevenueSignedOff || 0).toLocaleString()}
        </p>
        <p className="text-sm text-blue-500">
          Forecast: ${(annualRevenueForecast || 0).toLocaleString()}
        </p>
      </div>
    </div>
  );
};