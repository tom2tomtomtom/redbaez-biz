import React from 'react';

interface ProjectRevenueMetricProps {
  projectRevenue: number | null;
  projectRevenueSignedOff?: boolean;
  projectRevenueForecast?: boolean;
}

export const ProjectRevenueMetric = ({
  projectRevenue,
  projectRevenueSignedOff,
  projectRevenueForecast,
}: ProjectRevenueMetricProps) => {
  return (
    <div className="p-4 bg-blue-50/50 rounded-lg transition-all duration-300 hover:bg-blue-50">
      <p className="text-lg text-blue-600 font-medium">Project Revenue</p>
      <p className="text-3xl font-bold text-blue-600">
        ${projectRevenue?.toLocaleString() || '0'}
      </p>
      {projectRevenueSignedOff !== undefined && (
        <p className="text-sm text-blue-500">Status: {projectRevenueSignedOff ? 'Signed Off' : 'Not Signed Off'}</p>
      )}
      {projectRevenueForecast !== undefined && (
        <p className="text-sm text-blue-500">Forecast: {projectRevenueForecast ? 'Yes' : 'No'}</p>
      )}
    </div>
  );
};