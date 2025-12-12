'use client';

import React from 'react';

interface FilterButtonsProps {
  activeFilter: string;
  onFilterClick: (filter: string) => void;
}

const filters = [
  { id: 'all', label: 'All Products' },
  { id: 'brand', label: 'Shop by Brand' },
  { id: 'category', label: 'Shop by Category' },
];

const FilterButtons: React.FC<FilterButtonsProps> = ({ activeFilter, onFilterClick }) => {
  const baseClasses = "font-semibold tracking-wide py-3 px-7 rounded-full cursor-pointer transition-all duration-300 ease-in-out border-2 outline-none focus:outline-none user-select-none whitespace-nowrap text-center align-middle no-underline";

  const activeClasses = "bg-amber-400 text-slate-900 shadow-lg scale-105 hover:bg-amber-300 hover:shadow-xl hover:scale-110";
  
  const inactiveClasses = "bg-transparent text-sky-800 border-sky-800 hover:bg-gray-100 hover:border-slate-900 hover:text-slate-900 hover:-translate-y-0.5 focus:shadow-outline-blue-xs focus:border-slate-900";

  return (
    <div className="bg-white py-7 px-6 flex justify-center items-center flex-wrap gap-4 w-full mx-auto border-b border-gray-200">
      <div className="flex gap-3 justify-center flex-wrap">
        {filters.map(filter => (
          <button
            key={filter.id}
            onClick={() => onFilterClick(filter.id)}
            className={`${baseClasses} ${activeFilter === filter.id ? activeClasses : inactiveClasses}`}
            aria-label={`Filter products by ${filter.label}`}
            role="button"
            tabIndex={0}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterButtons;