/**
 * Type definitions for API responses and requests
 */

// Common response structure
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

// Error response
export interface ApiError {
  status: number;
  message: string;
  details?: Record<string, any>;
}

// News item
export interface NewsItem {
  id: number;
  title: string;
  source: string;
  summary: string | null;
  url: string | null;
  published_date: string | null;
  category: string | null;
  image_url?: string | null;
  created_at: string;
}

// Client
export interface Client {
  id: number;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  status: 'active' | 'pending' | 'inactive';
  industry: string;
  type: string;
  created_at: string;
  updated_at?: string;
}

// Contact
export interface Contact {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  is_primary: boolean;
  client_id: number;
}

// Task
export interface Task {
  id: number;
  title: string;
  description?: string;
  due_date: string | null;
  status: 'pending' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  client_id?: number;
  assigned_to?: string;
  created_at: string;
  updated_at?: string;
}

// Revenue forecast
export interface RevenueForecast {
  id: number;
  client_id: number;
  year: number;
  quarter: number;
  amount: number;
  likelihood: number;
  created_at: string;
  updated_at?: string;
}

// User
export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'admin' | 'user';
  created_at: string;
}

// Pagination parameters
export interface PaginationParams {
  page: number;
  limit: number;
}

// Sort parameters
export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

// Filter parameters
export interface FilterParams {
  field: string;
  value: string | number | boolean;
  operator?: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like';
}

// Query parameters
export interface QueryParams {
  pagination?: PaginationParams;
  sort?: SortParams;
  filters?: FilterParams[];
}
