// Define a single source of truth for client types
export type ClientType = 'prospect' | 'lead' | 'customer' | 'partner' | string;
export type ClientStatus = 'active' | 'inactive' | 'pending' | 'closed' | 'lost' | string;
export type CompanySize = 'solo' | 'small' | 'medium' | 'large' | 'enterprise' | string;

export interface Client {
  // Core properties
  id: number;
  name: string;
  type: ClientType;
  created_at: string;
  
  // Contact information
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  additional_contacts: any | null;
  
  // Company details
  industry: string | null;
  company_size: CompanySize | null;
  website: string | null;
  background: string | null;
  
  // Deal information
  status: ClientStatus | null;
  likelihood: number | null;
  notes: string | null;
  next_due_date: string | null;
  urgent: boolean | null;
  
  // Financial data
  annual_revenue: number | null;
  project_revenue: number | null;
  project_revenue_signed_off: boolean | null;
  project_revenue_forecast: boolean | null;
  annual_revenue_signed_off: number | null;
  annual_revenue_forecast: number | null;
  
  // Monthly forecasts
  forecast_jan: number | null;
  forecast_feb: number | null;
  forecast_mar: number | null;
  forecast_apr: number | null;
  forecast_may: number | null;
  forecast_jun: number | null;
  forecast_jul: number | null;
  forecast_aug: number | null;
  forecast_sep: number | null;
  forecast_oct: number | null;
  forecast_nov: number | null;
  forecast_dec: number | null;
  
  // Monthly actuals
  actual_jan: number | null;
  actual_feb: number | null;
  actual_mar: number | null;
  actual_apr: number | null;
  actual_may: number | null;
  actual_jun: number | null;
  actual_jul: number | null;
  actual_aug: number | null;
  actual_sep: number | null;
  actual_oct: number | null;
  actual_nov: number | null;
  actual_dec: number | null;
  
  // Metadata
  missing_fields: string[] | null;
}

// Database-specific types
export type ClientInsert = Omit<Client, 'id' | 'created_at' | 'missing_fields'> & {
  id?: number;
  created_at?: string;
  missing_fields?: string[] | null;
};

export type ClientUpdate = Partial<ClientInsert>;

// Conversion utility
export const convertToUnifiedClient = (source: any): Client => {
  return {
    id: source.id,
    name: source.name || '',
    type: source.type || 'prospect',
    created_at: source.created_at || new Date().toISOString(),
    contact_name: source.contact_name || null,
    contact_email: source.contact_email || null,
    contact_phone: source.contact_phone || null,
    additional_contacts: source.additional_contacts || null,
    industry: source.industry || null,
    company_size: source.company_size || null,
    website: source.website || null,
    background: source.background || null,
    status: source.status || null,
    likelihood: source.likelihood || null,
    notes: source.notes || null,
    next_due_date: source.next_due_date || null,
    urgent: source.urgent || null,
    annual_revenue: source.annual_revenue || null,
    project_revenue: source.project_revenue || null,
    project_revenue_signed_off: source.project_revenue_signed_off || null,
    project_revenue_forecast: source.project_revenue_forecast || null,
    annual_revenue_signed_off: source.annual_revenue_signed_off || null,
    annual_revenue_forecast: source.annual_revenue_forecast || null,
    forecast_jan: source.forecast_jan || null,
    forecast_feb: source.forecast_feb || null,
    forecast_mar: source.forecast_mar || null,
    forecast_apr: source.forecast_apr || null,
    forecast_may: source.forecast_may || null,
    forecast_jun: source.forecast_jun || null,
    forecast_jul: source.forecast_jul || null,
    forecast_aug: source.forecast_aug || null,
    forecast_sep: source.forecast_sep || null,
    forecast_oct: source.forecast_oct || null,
    forecast_nov: source.forecast_nov || null,
    forecast_dec: source.forecast_dec || null,
    actual_jan: source.actual_jan || null,
    actual_feb: source.actual_feb || null,
    actual_mar: source.actual_mar || null,
    actual_apr: source.actual_apr || null,
    actual_may: source.actual_may || null,
    actual_jun: source.actual_jun || null,
    actual_jul: source.actual_jul || null,
    actual_aug: source.actual_aug || null,
    actual_sep: source.actual_sep || null,
    actual_oct: source.actual_oct || null,
    actual_nov: source.actual_nov || null,
    actual_dec: source.actual_dec || null,
    missing_fields: source.missing_fields || null
  };
};
