import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ globalFilter, setGlobalFilter }) => {
  const [value, setValue] = useState(globalFilter || '');

  // Debounce search input
  useEffect(() => {
    const timeout = setTimeout(() => {
      setGlobalFilter(value.trim());
    }, 300);

    return () => clearTimeout(timeout);
  }, [value, setGlobalFilter]);

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        placeholder="Search User"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
};

export default SearchBar;