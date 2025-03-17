'use client';

import { useTranslation } from '../../../shared/lib/i18n';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { FilterPriority, FilterStatus, SortOption } from '../types';
import { Checkbox } from '../../../shared/ui/checkbox';
import { Label } from '../../../shared/ui/label';
import { useState } from 'react';

// Define DateFilterType here since it's not exported from types
type DateFilterType = 'all' | 'today' | 'tomorrow' | 'thisWeek' | 'nextWeek' | 'thisMonth' | 'custom';

// Mock DatePicker component since it doesn't exist
const DatePicker = ({ date, setDate, className }: { 
  date?: Date; 
  setDate: (date?: Date) => void; 
  className?: string 
}) => (
  <input 
    type="date" 
    value={date?.toISOString().split('T')[0] || ''} 
    onChange={(e) => setDate(e.target.value ? new Date(e.target.value) : undefined)}
    className={className}
  />
);

interface TodoFiltersProps {
  sortBy: SortOption;
  filterPriority: FilterPriority;
  filterStatus: FilterStatus;
  dateFilterType: DateFilterType;
  dateFilter?: string;
  isOverdue?: boolean;
  isImportant?: boolean;
  sortDirection?: 'asc' | 'desc';
  setSortBy: (sort: SortOption) => void;
  setFilterPriority: (priority: FilterPriority) => void;
  setFilterStatus: (status: FilterStatus) => void;
  setDateFilterType: (type: DateFilterType) => void;
  setDateFilter: (date?: string) => void;
  setIsOverdue: (isOverdue: boolean) => void;
  setIsImportant: (isImportant: boolean) => void;
  setSortDirection: (direction: 'asc' | 'desc') => void;
  isLoading: boolean;
  showAdvancedFilters?: boolean;
  toggleAdvancedFilters?: () => void;
}

/**
 * Filters component for the Todo page
 */
export function TodoFilters({
  sortBy,
  filterPriority,
  filterStatus,
  dateFilterType,
  dateFilter,
  isOverdue = false,
  isImportant = false,
  sortDirection = 'desc',
  setSortBy,
  setFilterPriority,
  setFilterStatus,
  setDateFilterType,
  setDateFilter,
  setIsOverdue,
  setIsImportant,
  setSortDirection,
  isLoading,
  showAdvancedFilters = false,
  toggleAdvancedFilters
}: TodoFiltersProps) {
  const { t } = useTranslation('todo');
  const [showDatePicker, setShowDatePicker] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <Select
          value={sortBy}
          onValueChange={(value) => setSortBy(value as SortOption)}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full sm:w-[180px] bg-background/50 border-primary/20">
            <SelectValue placeholder={t('todoList.sortBy')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{t('todoList.newestFirst')}</SelectItem>
            <SelectItem value="oldest">{t('todoList.oldestFirst')}</SelectItem>
            <SelectItem value="priority">{t('todoList.priority')}</SelectItem>
            <SelectItem value="dueDate">{t('todoList.dueDate')}</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={filterPriority}
          onValueChange={(value) => setFilterPriority(value as FilterPriority)}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full sm:w-[180px] bg-background/50 border-primary/20">
            <SelectValue placeholder={t('filters.priority')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filters.allPriorities')}</SelectItem>
            <SelectItem value="high">{t('filters.highPriority')}</SelectItem>
            <SelectItem value="medium">{t('filters.mediumPriority')}</SelectItem>
            <SelectItem value="low">{t('filters.lowPriority')}</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={filterStatus}
          onValueChange={(value) => setFilterStatus(value as FilterStatus)}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full sm:w-[180px] bg-background/50 border-primary/20">
            <SelectValue placeholder={t('filters.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filters.allStatus')}</SelectItem>
            <SelectItem value="active">{t('filters.active')}</SelectItem>
            <SelectItem value="completed">{t('filters.completed')}</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={sortDirection}
          onValueChange={(value) => setSortDirection(value as 'asc' | 'desc')}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full sm:w-[180px] bg-background/50 border-primary/20">
            <SelectValue placeholder={t('filters.sortDirection')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">{t('filters.descending')}</SelectItem>
            <SelectItem value="asc">{t('filters.ascending')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {toggleAdvancedFilters && (
        <button
          onClick={toggleAdvancedFilters}
          className="text-sm text-primary hover:underline focus:outline-none"
        >
          {showAdvancedFilters ? t('filters.hideAdvanced') : t('filters.showAdvanced')}
        </button>
      )}
      
      {showAdvancedFilters && (
        <div className="space-y-4 border rounded-md p-4 bg-background/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('filters.dateFilter')}</Label>
              <Select
                value={dateFilterType}
                onValueChange={(value) => {
                  setDateFilterType(value as DateFilterType);
                  if (value === 'custom') {
                    setShowDatePicker(true);
                  } else {
                    setShowDatePicker(false);
                  }
                }}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full bg-background/50 border-primary/20">
                  <SelectValue placeholder={t('filters.selectDateFilter')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.allDates')}</SelectItem>
                  <SelectItem value="today">{t('filters.today')}</SelectItem>
                  <SelectItem value="tomorrow">{t('filters.tomorrow')}</SelectItem>
                  <SelectItem value="thisWeek">{t('filters.thisWeek')}</SelectItem>
                  <SelectItem value="nextWeek">{t('filters.nextWeek')}</SelectItem>
                  <SelectItem value="thisMonth">{t('filters.thisMonth')}</SelectItem>
                  <SelectItem value="custom">{t('filters.customDate')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {showDatePicker && dateFilterType === 'custom' && (
              <div className="space-y-2">
                <Label>{t('filters.selectDate')}</Label>
                <div className="flex gap-2">
                  <DatePicker
                    date={dateFilter ? new Date(dateFilter) : undefined}
                    setDate={(date) => setDateFilter(date?.toISOString())}
                    className="w-full"
                  />
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isOverdue"
                checked={isOverdue}
                onCheckedChange={(checked) => setIsOverdue(checked === true)}
                disabled={isLoading}
              />
              <Label htmlFor="isOverdue" className="cursor-pointer">
                {t('filters.showOverdue')}
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isImportant"
                checked={isImportant}
                onCheckedChange={(checked) => setIsImportant(checked === true)}
                disabled={isLoading}
              />
              <Label htmlFor="isImportant" className="cursor-pointer">
                {t('filters.showImportant')}
              </Label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 