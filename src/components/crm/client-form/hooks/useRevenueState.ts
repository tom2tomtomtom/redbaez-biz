
import { useState, useCallback } from 'react';
import logger from '@/utils/logger';

export interface RevenueState {
  projectRevenue: string;
  annualRevenue: string;
  projectRevenueSignedOff: boolean;
  projectRevenueForecast: boolean;
  annualRevenueSignedOff: number;
  annualRevenueForecast: number;
}

export const useRevenueState = (initialData?: any) => {
  // Initialize state with default values or from provided initialData
  const [state, setState] = useState<RevenueState>({
    projectRevenue: initialData?.project_revenue?.toString() || '',
    annualRevenue: initialData?.annual_revenue?.toString() || '',
    projectRevenueSignedOff: initialData?.project_revenue_signed_off || false,
    projectRevenueForecast: initialData?.project_revenue_forecast || false,
    annualRevenueSignedOff: parseFloat(initialData?.annual_revenue_signed_off) || 0,
    annualRevenueForecast: parseFloat(initialData?.annual_revenue_forecast) || 0,
  });

  // Create individual setters for each field
  const setProjectRevenue = useCallback((value: string) => {
    setState(prev => ({ ...prev, projectRevenue: value }));
    logger.debug('Updated project revenue', { value });
  }, []);

  const setAnnualRevenue = useCallback((value: string) => {
    setState(prev => ({ ...prev, annualRevenue: value }));
    logger.debug('Updated annual revenue', { value });
  }, []);

  const setProjectRevenueSignedOff = useCallback((value: boolean) => {
    setState(prev => ({ ...prev, projectRevenueSignedOff: value }));
    logger.debug('Updated project revenue signed off', { value });
  }, []);

  const setProjectRevenueForecast = useCallback((value: boolean) => {
    setState(prev => ({ ...prev, projectRevenueForecast: value }));
    logger.debug('Updated project revenue forecast', { value });
  }, []);

  const setAnnualRevenueSignedOff = useCallback((value: number) => {
    setState(prev => ({ ...prev, annualRevenueSignedOff: value }));
    logger.debug('Updated annual revenue signed off', { value });
  }, []);

  const setAnnualRevenueForecast = useCallback((value: number) => {
    setState(prev => ({ ...prev, annualRevenueForecast: value }));
    logger.debug('Updated annual revenue forecast', { value });
  }, []);

  return {
    ...state,
    setProjectRevenue,
    setAnnualRevenue,
    setProjectRevenueSignedOff,
    setProjectRevenueForecast,
    setAnnualRevenueSignedOff,
    setAnnualRevenueForecast,
  };
};
