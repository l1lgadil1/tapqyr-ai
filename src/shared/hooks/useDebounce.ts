import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * A hook that provides debounced value
 * 
 * @param value The value to debounce
 * @param delay The delay in milliseconds 
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    // Set debouncedValue to value after the specified delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    // Return a cleanup function that will be called if
    // value changes before the delay has expired
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

/**
 * A hook that provides a debounced callback function
 * 
 * @param fn The callback function to debounce
 * @param delay The delay in milliseconds
 * @returns A debounced version of the callback function
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): [T, () => void, () => void] {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fnRef = useRef<T>(fn);
  const argsRef = useRef<Parameters<T>>();
  
  // Update the function ref when it changes
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);
  
  // Function to clear the timer
  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);
  
  // Function to immediately execute the callback
  const flush = useCallback(() => {
    cancel();
    if (argsRef.current) {
      fnRef.current(...argsRef.current);
    }
  }, [cancel]);
  
  // The debounced version of the callback
  const debouncedFn = useCallback(
    ((...args: Parameters<T>) => {
      argsRef.current = args;
      cancel();
      timerRef.current = setTimeout(() => {
        fnRef.current(...args);
      }, delay);
    }) as T,
    [delay, cancel]
  );
  
  // Clean up the timer when the component unmounts
  useEffect(() => {
    return cancel;
  }, [cancel]);
  
  return [debouncedFn, flush, cancel];
} 