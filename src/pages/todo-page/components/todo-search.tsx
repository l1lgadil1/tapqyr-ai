'use client';

import { Search } from 'lucide-react';
import { Input } from '../../../shared/ui/input';
import { useTranslation } from '../../../shared/lib/i18n';

interface TodoSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
}

/**
 * Search component for the Todo page
 */
export function TodoSearch({ searchQuery, setSearchQuery, isLoading }: TodoSearchProps) {
  const { t } = useTranslation('todo');

  return (
    <div className="relative mb-4">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="h-4 w-4 text-muted-foreground" />
      </div>
      <Input
        type="search"
        placeholder={t('filters.search')}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-10 bg-background/50 border-primary/20 focus:border-primary/50"
        disabled={isLoading}
        aria-label={t('filters.search')}
      />
    </div>
  );
} 