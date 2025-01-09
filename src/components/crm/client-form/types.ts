export interface ClientFormData {
  name: string;
  type: string;
  industry?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  company_size?: string;
  annual_revenue?: number;
  website?: string;
  notes?: string;
  status?: string;
  likelihood?: number;
  background?: string;
  project_revenue?: number;
  next_due_date?: string | null;
  project_revenue_signed_off?: boolean;
  project_revenue_forecast?: boolean;
  annual_revenue_signed_off?: number;
  annual_revenue_forecast?: number;
}

export interface UseClientFormSubmitProps {
  clientId?: string;
  onSuccess?: () => void;
}