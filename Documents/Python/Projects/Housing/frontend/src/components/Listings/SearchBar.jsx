import { useState, useEffect } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

const SearchBar = ({ onSearch, initialValue = '', placeholder = 'Search by city, university, or address...' }) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <div className="relative">
      <div className="relative flex items-center">
        <FiSearch className="absolute left-4 text-gray-400" size={20} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors"
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
          >
            <FiX size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;



