import React from 'react';
import { ClientSearch } from '@/components/crm/client-search/ClientSearch';
import { IntelSearch } from '@/components/crm/intel-search/IntelSearch';

interface SearchSectionProps {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
}

export const SearchSection: React.FC<SearchSectionProps> = ({
  searchInput,
  onSearchInputChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="flex items-start space-x-4">
        <ClientSearch />
        <IntelSearch 
          searchInput={searchInput}
          onSearchInputChange={onSearchInputChange}
        />
      </div>
    </div>
  );
};