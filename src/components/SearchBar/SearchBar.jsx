import React, { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ globalFilter, setGlobalFilter }) => {
  const [value, setValue] = useState(globalFilter || '');

  useEffect(() => {
    setValue(globalFilter || '');
  }, [globalFilter]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setGlobalFilter(value.trim());
    }, 250);

    return () => clearTimeout(timeout);
  }, [value, setGlobalFilter]);

  return (
    <div className="search-shell">
      <input
        type="text"
        placeholder="Search user, company, service, or postcode"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="search-shell__input"
        aria-label="Search waitlist"
      />

      {value ? (
        <button
          type="button"
          className="search-shell__clear"
          onClick={() => setValue('')}
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      ) : null}

      <div className="search-shell__icon" aria-hidden="true">
        <Search size={18} />
      </div>
    </div>
  );
};

export default SearchBar;

