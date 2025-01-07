import React from 'react';

interface AnnualRevenueMetricProps {
  annualRevenue: number | null;
  annualRevenueSignedOff?: number;
  annualRevenueForecast?: number;
}

export const AnnualRevenueMetric = ({
  annualRevenue,
  annualRevenueSignedOff,
  annualRevenueForecast,
}: AnnualRevenueMetricProps) => {
  return (
    <div className="p-4 bg-blue-50/50 rounded-lg transition-all duration-300 hover:bg-blue-50">
      <p className="text-lg text-blue-600 font-medium">Annual Revenue</p>
      <p className="text-3xl font-bold text-blue-600">
        ${annualRevenue?.toLocaleString() || '0'}
      </p>
      {annualRevenueSignedOff !== undefined && (
        <p className="text-sm text-blue-500">Signed Off: ${annualRevenueSignedOff?.toLocaleString()}</p>
      )}
      {annualRevenueForecast !== undefined && (
        <p className="text-sm text-blue-500">Forecast: ${annualRevenueForecast?.toLocaleString()}</p>
      )}
    </div>
  );
};