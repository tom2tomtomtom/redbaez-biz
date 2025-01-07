import { useState } from 'react';

export const useRevenueState = (initialData?: any) => {
  const [projectRevenue, setProjectRevenue] = useState(initialData?.project_revenue?.toString() || '');
  const [annualRevenue, setAnnualRevenue] = useState(initialData?.annual_revenue?.toString() || '');
  const [projectRevenueSignedOff, setProjectRevenueSignedOff] = useState(initialData?.project_revenue_signed_off || false);
  const [projectRevenueForecast, setProjectRevenueForecast] = useState(initialData?.project_revenue_forecast || false);
  const [annualRevenueSignedOff, setAnnualRevenueSignedOff] = useState(initialData?.annual_revenue_signed_off || 0);
  const [annualRevenueForecast, setAnnualRevenueForecast] = useState(initialData?.annual_revenue_forecast || 0);

  return {
    projectRevenue,
    annualRevenue,
    projectRevenueSignedOff,
    projectRevenueForecast,
    annualRevenueSignedOff,
    annualRevenueForecast,
    setProjectRevenue,
    setAnnualRevenue,
    setProjectRevenueSignedOff,
    setProjectRevenueForecast,
    setAnnualRevenueSignedOff,
    setAnnualRevenueForecast,
  };
};