import { format, formatDistance, parseISO, isValid, addDays, isBefore, isAfter, isToday } from 'date-fns';

/**
 * Formats a date string to a human-readable format
 * 
 * @param dateString - The date string to format
 * @param formatString - The format string to use (default: 'PPP')
 * @param fallback - The fallback value to return if the date is invalid
 * @returns The formatted date string or fallback value
 */
export function formatDate(
  dateString: string | null | undefined,
  formatString: string = 'PPP',
  fallback: string = 'N/A'
): string {
  if (!dateString) return fallback;
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return fallback;
    
    return format(date, formatString);
  } catch (error) {
    return fallback;
  }
}

/**
 * Formats a date string to a relative format (e.g., "2 days ago")
 * 
 * @param dateString - The date string to format
 * @param baseDate - The base date to compare against (default: now)
 * @param fallback - The fallback value to return if the date is invalid
 * @returns The relative date string or fallback value
 */
export function formatRelativeDate(
  dateString: string | null | undefined,
  baseDate: Date = new Date(),
  fallback: string = 'N/A'
): string {
  if (!dateString) return fallback;
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return fallback;
    
    return formatDistance(date, baseDate, { addSuffix: true });
  } catch (error) {
    return fallback;
  }
}

/**
 * Formats a date for input fields (YYYY-MM-DD)
 * 
 * @param dateString - The date string to format
 * @param fallback - The fallback value to return if the date is invalid
 * @returns The formatted date string or fallback value
 */
export function formatDateForInput(
  dateString: string | null | undefined,
  fallback: string = ''
): string {
  if (!dateString) return fallback;
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return fallback;
    
    return format(date, 'yyyy-MM-dd');
  } catch (error) {
    return fallback;
  }
}

/**
 * Checks if a date is in the past
 * 
 * @param dateString - The date string to check
 * @param baseDate - The base date to compare against (default: now)
 * @returns True if the date is in the past
 */
export function isPastDate(
  dateString: string | null | undefined,
  baseDate: Date = new Date()
): boolean {
  if (!dateString) return false;
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return false;
    
    return isBefore(date, baseDate);
  } catch (error) {
    return false;
  }
}

/**
 * Checks if a date is in the future
 * 
 * @param dateString - The date string to check
 * @param baseDate - The base date to compare against (default: now)
 * @returns True if the date is in the future
 */
export function isFutureDate(
  dateString: string | null | undefined,
  baseDate: Date = new Date()
): boolean {
  if (!dateString) return false;
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return false;
    
    return isAfter(date, baseDate);
  } catch (error) {
    return false;
  }
}

/**
 * Checks if a date is today
 * 
 * @param dateString - The date string to check
 * @returns True if the date is today
 */
export function isDateToday(dateString: string | null | undefined): boolean {
  if (!dateString) return false;
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return false;
    
    return isToday(date);
  } catch (error) {
    return false;
  }
}

/**
 * Checks if a date is within a certain number of days
 * 
 * @param dateString - The date string to check
 * @param days - The number of days to check
 * @param baseDate - The base date to compare against (default: now)
 * @returns True if the date is within the specified number of days
 */
export function isDateWithinDays(
  dateString: string | null | undefined,
  days: number,
  baseDate: Date = new Date()
): boolean {
  if (!dateString) return false;
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return false;
    
    const futureDate = addDays(baseDate, days);
    return isBefore(date, futureDate) && isAfter(date, baseDate);
  } catch (error) {
    return false;
  }
}

/**
 * Gets the ISO string for a date
 * 
 * @param date - The date to convert
 * @returns The ISO string for the date
 */
export function toISOString(date: Date): string {
  return date.toISOString();
}

/**
 * Gets the current date as an ISO string
 * 
 * @returns The current date as an ISO string
 */
export function getCurrentISOString(): string {
  return new Date().toISOString();
}
