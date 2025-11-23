'use client';

import { Filter, Search } from 'iconoir-react';
import { useState } from 'react';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  onFilterClick?: () => void;
}

export const SearchBar = ({ onSearch, onFilterClick }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    // Busca em tempo real enquanto digita
    onSearch?.(value);
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onFilterClick}
          className="text-[#db5852] p-1.5 hover:bg-gray-50 rounded transition-colors flex-shrink-0"
          aria-label="Filtros"
        >
          <Filter className="w-5 h-5" strokeWidth={2} />
        </button>
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder="Search experiences"
            className="w-full px-4 py-2.5 pr-10 bg-gray-50 rounded-lg text-[#1f1f1f] text-sm placeholder:text-[#757683] focus:outline-none focus:ring-0 focus:bg-white border-0"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#757683] hover:text-[#db5852] transition-colors"
            aria-label="Buscar"
          >
            <Search className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>
      </div>
    </form>
  );
};

