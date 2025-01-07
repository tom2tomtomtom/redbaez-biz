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
  };
};