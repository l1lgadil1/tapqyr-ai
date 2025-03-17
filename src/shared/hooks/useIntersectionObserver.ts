'use client';

import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverProps {
  threshold?: number;
  root?: Element | null;
  rootMargin?: string;
  enabled?: boolean;
}

/**
 * Custom hook for intersection observer functionality
 * Useful for implementing infinite scrolling
 */
export function useIntersectionObserver({
  threshold = 0.1,
  root = null,
  rootMargin = '0px',
  enabled = true,
}: UseIntersectionObserverProps = {}) {
  const [ref, setRef] = useState<Element | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // If the hook is disabled or there's no element to observe, do nothing
    if (!enabled || !ref) return;

    // Cleanup previous observer
    if (observer.current) {
      observer.current.disconnect();
    }

    // Create a new observer
    observer.current = new IntersectionObserver(
      ([entry]) => {
        // Update state when intersection status changes
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold, root, rootMargin }
    );

    // Start observing the target element
    observer.current.observe(ref);

    // Cleanup function to disconnect the observer when component unmounts
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [ref, threshold, root, rootMargin, enabled]);

  return { ref: setRef, isIntersecting };
} 