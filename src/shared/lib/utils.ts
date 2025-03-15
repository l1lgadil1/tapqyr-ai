import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useState, useEffect } from 'react';

/**
 * Combines multiple class names into a single string, merging Tailwind CSS classes
 * @param inputs - Class names to combine
 * @returns Merged class names string
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  // Simple UUID generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Desktop breakpoint in pixels
export const DESKTOP_BREAKPOINT = 1024;

/**
 * Safely checks if the current device is a desktop
 * Works in both client and server environments
 */
export function isDesktop(): boolean {
  // Check if window is defined (client-side)
  if (typeof window !== 'undefined') {
    return window.innerWidth >= DESKTOP_BREAKPOINT;
  }
  
  // Default to false on server-side
  return false;
}

/**
 * Hook to detect if the current device is a desktop
 * Includes window resize listener
 */
export function useIsDesktop(): boolean {
  const [isDesktopDevice, setIsDesktopDevice] = useState(isDesktop());
  
  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktopDevice(window.innerWidth >= DESKTOP_BREAKPOINT);
    };
    
    // Initial check to ensure correct value after hydration
    checkIsDesktop();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIsDesktop);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkIsDesktop);
    };
  }, []);
  
  return isDesktopDevice;
}

/**
 * Custom animation variants for Framer Motion
 */
export const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  },
  slideInFromLeft: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 },
    transition: { type: 'spring', stiffness: 300, damping: 30 }
  },
  slideInFromRight: {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 20, opacity: 0 },
    transition: { type: 'spring', stiffness: 300, damping: 30 }
  },
  slideInFromTop: {
    initial: { y: -20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
    transition: { type: 'spring', stiffness: 300, damping: 30 }
  },
  slideInFromBottom: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 20, opacity: 0 },
    transition: { type: 'spring', stiffness: 300, damping: 30 }
  },
  scale: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.9, opacity: 0 },
    transition: { type: 'spring', stiffness: 300, damping: 30 }
  },
  typing: {
    initial: { width: 0 },
    animate: { width: '100%' },
    transition: { duration: 0.5 }
  }
}; 