import { useState, useEffect } from 'react';

interface RevenueState {
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
      setProjectRevenue(initialData.project_revenue?.toString() || '');
      setAnnualRevenue(initialData.annual_revenue?.toString() || '');
      setProjectRevenueSignedOff(initialData.project_revenue_signed_off || false);
      setProjectRevenueForecast(initialData.project_revenue_forecast || false);
      setAnnualRevenueSignedOff(initialData.annual_revenue_signed_off?.toString() || '');
      setAnnualRevenueForecast(initialData.annual_revenue_forecast?.toString() || '');
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