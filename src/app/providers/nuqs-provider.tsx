'use client';

import { NuqsAdapter } from 'nuqs/adapters/react';
import { ReactNode } from 'react';

interface NuqsProviderProps {
  children: ReactNode;
}

export function NuqsProvider({ children }: NuqsProviderProps) {
  return (
    <NuqsAdapter>
      {children}
    </NuqsAdapter>
  );
} 