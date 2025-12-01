import React from 'react';
import { Search, Plus } from 'lucide-react';

const TableSearchBar = ({ searchTerm, onSearchChange, searchPlaceholder, onAddClick, addButtonText, className = '' }) => {
  return (
    <div className={`mb-4 flex justify-between [@media(min-width:750px)]:flex-row flex-col gap-2 ${className}`}>
      <div className="relative w-64">
        <input type="text" value={searchTerm} onChange={onSearchChange} placeholder={searchPlaceholder} className="search-input-admin" />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
      </div>
      <button onClick={onAddClick} className="add-button-admin">
        <Plus size={16} /> {addButtonText}
      </button>
    </div>
  );
};

export default TableSearchBar;
