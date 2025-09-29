import { useRef, useMemo, useEffect, DependencyList } from 'react';
import { isEqual } from 'lodash-es';

/**
 * Custom hook for deep memoization of values
 * 
 * Unlike useMemo, this hook performs a deep equality check on dependencies
 * to prevent unnecessary recalculations when objects have the same values
 * but different references.
 * 
 * @param factory - Function that returns the memoized value
 * @param deps - Dependency array for the memoization
 * @returns The memoized value
 */
export function useMemoizedValue<T>(factory: () => T, deps: DependencyList): T {
  // Store the previous dependencies for comparison
  const depsRef = useRef<DependencyList | undefined>(undefined);
  
  // Check if dependencies have changed using deep comparison
  const depsChanged = useMemo(() => {
    if (!depsRef.current) return true;
    
    // Compare current deps with previous deps
    return !isEqual(deps, depsRef.current);
  }, [deps]);
  
  // Store the memoized value
  const valueRef = useRef<T | undefined>(undefined);
  
  // Update the memoized value if dependencies changed
  if (depsChanged || valueRef.current === undefined) {
    valueRef.current = factory();
  }
  
  // Update the stored dependencies after render
  useEffect(() => {
    depsRef.current = deps;
  }, [deps]);
  
  return valueRef.current as T;
}

/**
 * Custom hook for memoizing expensive calculations with deep dependency comparison
 * 
 * This hook is useful for expensive calculations that depend on objects or arrays
 * that might have the same values but different references.
 * 
 * @param callback - Function that performs the expensive calculation
 * @param deps - Dependency array for the calculation
 * @returns The result of the calculation
 */
export function useMemoizedCalculation<T>(callback: () => T, deps: DependencyList): T {
  return useMemoizedValue(callback, deps);
}

/**
 * Custom hook for memoizing a callback function with deep dependency comparison
 * 
 * Similar to useCallback, but with deep equality checks on dependencies.
 * 
 * @param callback - The callback function to memoize
 * @param deps - Dependency array for the callback
 * @returns The memoized callback function
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: DependencyList
): T {
  return useMemoizedValue(() => callback, deps);
}

export default useMemoizedValue;
