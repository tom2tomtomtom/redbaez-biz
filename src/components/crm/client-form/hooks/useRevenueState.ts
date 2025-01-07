import { useState, useEffect } from 'react';

export const useRevenueState = (initialData?: any) => {
  const [projectRevenue, setProjectRevenue] = useState('');
  const [annualRevenue, setAnnualRevenue] = useState('');
  const [projectRevenueSignedOff, setProjectRevenueSignedOff] = useState(false);
  const [projectRevenueForecast, setProjectRevenueForecast] = useState(false);
  const [annualRevenueSignedOff, setAnnualRevenueSignedOff] = useState('0');
  const [annualRevenueForecast, setAnnualRevenueForecast] = useState('0');

  useEffect(() => {
    if (initialData) {
      console.log('Initializing revenue state with:', initialData);
      setProjectRevenue(initialData.project_revenue?.toString() || '');
      setAnnualRevenue(initialData.annual_revenue?.toString() || '');
      setProjectRevenueSignedOff(initialData.project_revenue_signed_off || false);
      setProjectRevenueForecast(initialData.project_revenue_forecast || false);
      setAnnualRevenueSignedOff(initialData.annual_revenue_signed_off?.toString() || '0');
      setAnnualRevenueForecast(initialData.annual_revenue_forecast?.toString() || '0');
    }
  }, [initialData]);

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