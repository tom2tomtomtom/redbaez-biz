import { useState, useEffect } from 'react';

interface UseClientFormStateProps {
  initialData?: any;
  isEditing?: boolean;
}

export const useClientFormState = ({ initialData, isEditing }: UseClientFormStateProps) => {
  const [companyName, setCompanyName] = useState('');
  const [status, setStatus] = useState('');
  const [likelihood, setLikelihood] = useState('');
  const [projectRevenue, setProjectRevenue] = useState('');
  const [revenue, setRevenue] = useState('');
  const [type, setType] = useState('business');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [website, setWebsite] = useState('');
  const [background, setBackground] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [projectRevenueSignedOff, setProjectRevenueSignedOff] = useState(false);
  const [projectRevenueForecast, setProjectRevenueForecast] = useState(false);
  const [annualRevenueSignedOff, setAnnualRevenueSignedOff] = useState('');
  const [annualRevenueForecast, setAnnualRevenueForecast] = useState('');

  useEffect(() => {
    if (initialData && isEditing) {
      setCompanyName(initialData.name || '');
      setStatus(initialData.status || '');
      setLikelihood(initialData.likelihood?.toString() || '');
      setProjectRevenue(initialData.project_revenue?.toString() || '');
      setRevenue(initialData.annual_revenue?.toString() || '');
      setType(initialData.type || 'business');
      setIndustry(initialData.industry || '');
      setCompanySize(initialData.company_size || '');
      setWebsite(initialData.website || '');
      setBackground(initialData.background || '');
      setProjectRevenueSignedOff(initialData.project_revenue_signed_off || false);
      setProjectRevenueForecast(initialData.project_revenue_forecast || false);
      setAnnualRevenueSignedOff(initialData.annual_revenue_signed_off?.toString() || '');
      setAnnualRevenueForecast(initialData.annual_revenue_forecast?.toString() || '');
    }
  }, [initialData, isEditing]);

  return {
    companyName,
    setCompanyName,
    status,
    setStatus,
    likelihood,
    setLikelihood,
    projectRevenue,
    setProjectRevenue,
    revenue,
    setRevenue,
    type,
    setType,
    industry,
    setIndustry,
    companySize,
    setCompanySize,
    website,
    setWebsite,
    background,
    setBackground,
    isLoading,
    setIsLoading,
    projectRevenueSignedOff,
    setProjectRevenueSignedOff,
    projectRevenueForecast,
    setProjectRevenueForecast,
    annualRevenueSignedOff,
    setAnnualRevenueSignedOff,
    annualRevenueForecast,
    setAnnualRevenueForecast,
  };
};