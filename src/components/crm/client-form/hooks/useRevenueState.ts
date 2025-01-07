import { useState, useEffect } from 'react';

const parseNumericValue = (value: string | number | null): string => {
  if (value === null || value === '') return '';
  return value.toString();
};

export interface RevenueState {
  projectRevenue: string;
  annualRevenue: string;
  projectRevenueSignedOff: boolean;
  projectRevenueForecast: boolean;
  annualRevenueSignedOff: string;
  annualRevenueForecast: string;
}

export const useRevenueState = (initialData?: any) => {
  const [projectRevenue, setProjectRevenue] = useState('');
  const [annualRevenue, setAnnualRevenue] = useState('');
  const [projectRevenueSignedOff, setProjectRevenueSignedOff] = useState(false);
  const [projectRevenueForecast, setProjectRevenueForecast] = useState(false);
  const [annualRevenueSignedOff, setAnnualRevenueSignedOff] = useState('');
  const [annualRevenueForecast, setAnnualRevenueForecast] = useState('');

  useEffect(() => {
    if (initialData) {
      console.log('Initializing revenue state with:', initialData);
      setProjectRevenue(parseNumericValue(initialData.project_revenue));
      setAnnualRevenue(parseNumericValue(initialData.annual_revenue));
      setProjectRevenueSignedOff(initialData.project_revenue_signed_off === true);
      setProjectRevenueForecast(initialData.project_revenue_forecast === true);
      setAnnualRevenueSignedOff(parseNumericValue(initialData.annual_revenue_signed_off));
      setAnnualRevenueForecast(parseNumericValue(initialData.annual_revenue_forecast));
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