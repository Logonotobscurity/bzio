'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Search } from 'lucide-react';
import { useState, useCallback } from 'react';

interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'dateRange';
  placeholder?: string;
  options?: { value: string; label: string }[];
}

interface DashboardFiltersProps {
  filters: FilterOption[];
  onFilter: (filters: Record<string, string | Record<string, string>>) => void;
  onClear: () => void;
}

export function DashboardFilters({ filters, onFilter, onClear }: DashboardFiltersProps) {
  const [activeFilters, setActiveFilters] = useState<Record<string, string | Record<string, string>>>({});
  const [isOpen, setIsOpen] = useState(false);

  const getFilterValue = (key: string): string => {
    const value = activeFilters[key];
    if (typeof value === 'string') return value;
    return '';
  };

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      const newFilters = { ...activeFilters, [key]: value };
      setActiveFilters(newFilters);
      onFilter(newFilters);
    },
    [activeFilters, onFilter]
  );

  const handleClear = useCallback(() => {
    setActiveFilters({});
    onClear();
  }, [onClear]);

  const activeFilterCount = Object.values(activeFilters).filter(v => v).length;

  return (
    <div className="space-y-4">
      {/* Filter Toggle Button */}
      <div className="flex items-center gap-2">
        <Button
          variant={isOpen ? 'default' : 'outline'}
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="gap-2"
        >
          <Search className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-red-500 hover:text-red-700"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Filter Fields */}
      {isOpen && (
        <div className="grid gap-4 p-4 bg-slate-50 rounded-lg border">
          {filters.map((filter) => (
            <div key={filter.key} className="space-y-2">
              <label className="text-sm font-medium">{filter.label}</label>

              {filter.type === 'text' && (
                <Input
                  placeholder={filter.placeholder || `Search ${filter.label.toLowerCase()}...`}
                  value={getFilterValue(filter.key)}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  className="text-sm"
                />
              )}

              {filter.type === 'select' && filter.options && (
                <select
                  title={`Select ${filter.label}`}
                  aria-label={`Select ${filter.label}`}
                  value={getFilterValue(filter.key)}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                >
                  <option value="">All</option>
                  {filter.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}

              {filter.type === 'date' && (
                <input
                  type="date"
                  title={`Select ${filter.label}`}
                  aria-label={`Select ${filter.label}`}
                  value={getFilterValue(filter.key)}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              )}

              {filter.type === 'dateRange' && (
                <div className="flex gap-2">
                  <input
                    type="date"
                    placeholder="From"
                    title="Start date range"
                    value={getFilterValue(`${filter.key}_from`)}
                    onChange={(e) => handleFilterChange(`${filter.key}_from`, e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-md text-sm"
                  />
                  <input
                    type="date"
                    placeholder="To"
                    title="End date range"
                    aria-label="End date range"
                    value={getFilterValue(`${filter.key}_to`)}
                    onChange={(e) => handleFilterChange(`${filter.key}_to`, e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-md text-sm"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
