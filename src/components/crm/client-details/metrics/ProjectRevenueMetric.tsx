import React from 'react';

interface ProjectRevenueMetricProps {
  projectRevenue: number | null;
}

export const ProjectRevenueMetric = ({
  projectRevenue,
}: ProjectRevenueMetricProps) => {
  return (
    <div className="p-4 bg-blue-50/50 rounded-lg transition-all duration-300 hover:bg-blue-50">
      <p className="text-lg text-blue-600 font-medium">Project Revenue</p>
      <p className="text-3xl font-bold text-blue-600">
        ${projectRevenue?.toLocaleString() || '0'}
      </p>
    </div>
  );
};