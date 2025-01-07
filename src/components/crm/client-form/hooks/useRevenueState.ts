import { useState, useEffect } from 'react';

// Helper function to parse numeric values
const parseNumericValue = (value: string | number | null): string => {
  if (value === null || value === '') return '';
  return typeof value === 'string' ? value : value.toString();
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
  console.log('useRevenueState initialData:', initialData);

  const [projectRevenue, setProjectRevenue] = useState(
    parseNumericValue(initialData?.project_revenue)
  );
  const [annualRevenue, setAnnualRevenue] = useState(
    parseNumericValue(initialData?.annual_revenue)
  );
  const [projectRevenueSignedOff, setProjectRevenueSignedOff] = useState(
    Boolean(initialData?.project_revenue_signed_off)
  );
  const [projectRevenueForecast, setProjectRevenueForecast] = useState(
    Boolean(initialData?.project_revenue_forecast)
  );
  const [annualRevenueSignedOff, setAnnualRevenueSignedOff] = useState(
    parseNumericValue(initialData?.annual_revenue_signed_off)
  );
  const [annualRevenueForecast, setAnnualRevenueForecast] = useState(
    parseNumericValue(initialData?.annual_revenue_forecast)
  );

  // Update state when initialData changes
  useEffect(() => {
    if (initialData) {
      console.log('Updating revenue state with:', initialData);
      setProjectRevenue(parseNumericValue(initialData.project_revenue));
      setAnnualRevenue(parseNumericValue(initialData.annual_revenue));
      setProjectRevenueSignedOff(Boolean(initialData.project_revenue_signed_off));
      setProjectRevenueForecast(Boolean(initialData.project_revenue_forecast));
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