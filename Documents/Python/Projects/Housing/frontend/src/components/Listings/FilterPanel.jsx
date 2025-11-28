import { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiX } from 'react-icons/fi';

const FilterPanel = ({ filters, onFilterChange, onClearFilters }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const amenitiesList = [
    'WiFi',
    'Parking',
    'Laundry In Unit',
    'Laundry On Site',
    'Pet Friendly',
    'Furnished',
    'Fitness Center',
    'Pool',
    'Dishwasher',
    'Air Conditioning',
    'Balcony',
    'Backyard',
  ];

  const activeFiltersCount = Object.values(filters).filter(
    (value) => value && value.length > 0 && value !== 'all'
  ).length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">
          Filters
          {activeFiltersCount > 0 && (
            <span className="ml-2 text-sm font-normal text-orange-600">
              ({activeFiltersCount} active)
            </span>
          )}
        </h3>
        {activeFiltersCount > 0 && (
          <button
            onClick={onClearFilters}
            className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
          >
            <FiX size={16} />
            Clear all
          </button>
        )}
      </div>

      {/* Basic Filters */}
      <div className="space-y-6">
        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price Range
          </label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Min"
              value={filters.priceMin || ''}
              onChange={(e) => handleFilterChange('priceMin', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.priceMax || ''}
              onChange={(e) => handleFilterChange('priceMax', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Bedrooms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bedrooms
          </label>
          <div className="grid grid-cols-5 gap-2">
            {['Studio', '1', '2', '3', '4+'].map((bedroom) => (
              <button
                key={bedroom}
                onClick={() =>
                  handleFilterChange('bedrooms', bedroom === filters.bedrooms ? '' : bedroom)
                }
                className={`px-3 py-2 text-sm font-medium rounded-lg border-2 transition-colors ${
                  filters.bedrooms === bedroom
                    ? 'border-orange-600 bg-orange-50 text-orange-600'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                {bedroom}
              </button>
            ))}
          </div>
        </div>

        {/* Bathrooms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bathrooms
          </label>
          <select
            value={filters.bathrooms || ''}
            onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
          >
            <option value="">Any</option>
            <option value="1">1+</option>
            <option value="1.5">1.5+</option>
            <option value="2">2+</option>
            <option value="2.5">2.5+</option>
            <option value="3">3+</option>
          </select>
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full mt-6 py-3 flex items-center justify-center gap-2 text-orange-600 hover:text-orange-700 font-medium transition-colors"
      >
        {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
        {showAdvanced ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
      </button>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="mt-6 pt-6 border-t border-gray-200 space-y-6">
          {/* Lease Term */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lease Term
            </label>
            <select
              value={filters.leaseTerm || ''}
              onChange={(e) => handleFilterChange('leaseTerm', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
            >
              <option value="">Any</option>
              <option value="Month-to-month">Month-to-month</option>
              <option value="6 months">6 months</option>
              <option value="9 months">9 months</option>
              <option value="12 months">12 months</option>
              <option value="Flexible">Flexible</option>
            </select>
          </div>

          {/* Distance to Campus */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Distance to Campus
            </label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={filters.maxDistance || 10}
              onChange={(e) => handleFilterChange('maxDistance', e.target.value)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0 mi</span>
              <span className="font-medium text-orange-600">
                {filters.maxDistance || 10} mi
              </span>
              <span>10+ mi</span>
            </div>
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Type
            </label>
            <select
              value={filters.propertyType || ''}
              onChange={(e) => handleFilterChange('propertyType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
            >
              <option value="">All Types</option>
              <option value="Apartment">Apartment</option>
              <option value="House">House</option>
              <option value="Condo">Condo</option>
              <option value="Townhouse">Townhouse</option>
              <option value="Studio">Studio</option>
            </select>
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Amenities
            </label>
            <div className="grid grid-cols-2 gap-2">
              {amenitiesList.map((amenity) => (
                <label key={amenity} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.amenities?.includes(amenity) || false}
                    onChange={(e) => {
                      const currentAmenities = filters.amenities || [];
                      const newAmenities = e.target.checked
                        ? [...currentAmenities, amenity]
                        : currentAmenities.filter((a) => a !== amenity);
                      handleFilterChange('amenities', newAmenities);
                    }}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Utilities Included */}
          <div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.utilitiesIncluded || false}
                onChange={(e) => handleFilterChange('utilitiesIncluded', e.target.checked)}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                Utilities Included
              </span>
            </label>
          </div>

          {/* Pet Friendly */}
          <div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.petFriendly || false}
                onChange={(e) => handleFilterChange('petFriendly', e.target.checked)}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                Pet Friendly
              </span>
            </label>
          </div>

          {/* Subleases Only */}
          <div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.subleaseOnly || false}
                onChange={(e) => handleFilterChange('subleaseOnly', e.target.checked)}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                Subleases Only
              </span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;



