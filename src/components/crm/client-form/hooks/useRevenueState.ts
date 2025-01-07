import { useState, useEffect } from 'react';

export const useRevenueState = (initialData?: any) => {
  const [projectRevenue, setProjectRevenue] = useState('');
  const [annualRevenue, setAnnualRevenue] = useState('');

  useEffect(() => {
    if (initialData) {
      setProjectRevenue(initialData.project_revenue?.toString() || '');
      setAnnualRevenue(initialData.annual_revenue?.toString() || '');
    }
  }, [initialData]);

  return {
    projectRevenue,
    annualRevenue,
    setProjectRevenue,
    setAnnualRevenue,
  };
};