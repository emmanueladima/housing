import { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiX } from 'react-icons/fi';

const RoommateFilterPanel = ({ filters, onFilterChange, onClearFilters }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const activeFiltersCount = Object.values(filters).filter(
    (value) => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'boolean') return value === true;
      return value && value !== '' && value !== 'all';
    }
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
        {/* Cleanliness Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cleanliness Level
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={filters.cleanlinessMin || 1}
              onChange={(e) => handleFilterChange('cleanlinessMin', parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm font-medium text-orange-600 w-12 text-center">
              {filters.cleanlinessMin || 1}+
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Messy</span>
            <span>Very Clean</span>
          </div>
        </div>

        {/* Noise Tolerance */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Noise Tolerance
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={filters.noiseLevelMax || 5}
              onChange={(e) => handleFilterChange('noiseLevelMax', parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm font-medium text-orange-600 w-12 text-center">
              ≤{filters.noiseLevelMax || 5}
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Quiet</span>
            <span>Loud OK</span>
          </div>
        </div>

        {/* Budget Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Budget Range
          </label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Min $"
              value={filters.budgetMin || ''}
              onChange={(e) => handleFilterChange('budgetMin', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
            />
            <input
              type="number"
              placeholder="Max $"
              value={filters.budgetMax || ''}
              onChange={(e) => handleFilterChange('budgetMax', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
            />
          </div>
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
          {/* Sleep Schedule */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sleep Schedule
            </label>
            <div className="space-y-2">
              {[
                { value: 'early-bird', label: 'Early Bird (before 11 PM)' },
                { value: 'normal', label: 'Normal (11 PM - 1 AM)' },
                { value: 'night-owl', label: 'Night Owl (after 1 AM)' },
              ].map((option) => (
                <label key={option.value} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.sleepSchedule?.includes(option.value) || false}
                    onChange={(e) => {
                      const current = filters.sleepSchedule || [];
                      const newSchedule = e.target.checked
                        ? [...current, option.value]
                        : current.filter((s) => s !== option.value);
                      handleFilterChange('sleepSchedule', newSchedule);
                    }}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Pet Preferences */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pet Preferences
            </label>
            <div className="space-y-2">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.hasPets || false}
                  onChange={(e) => handleFilterChange('hasPets', e.target.checked)}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-gray-700">Has Pets</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.noPets || false}
                  onChange={(e) => handleFilterChange('noPets', e.target.checked)}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-gray-700">No Pets</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.petAllergies || false}
                  onChange={(e) => handleFilterChange('petAllergies', e.target.checked)}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-gray-700">Pet Allergies</span>
              </label>
            </div>
          </div>

          {/* Smoking */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Smoking
            </label>
            <select
              value={filters.smoking || ''}
              onChange={(e) => handleFilterChange('smoking', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
            >
              <option value="">Any</option>
              <option value="non-smoker">Non-Smoker</option>
              <option value="social-smoker">Social Smoker</option>
              <option value="smoker">Smoker</option>
            </select>
          </div>

          {/* Study Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Study Style
            </label>
            <div className="space-y-2">
              {['quiet', 'background', 'music'].map((style) => (
                <label key={style} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.studyStyle?.includes(style) || false}
                    onChange={(e) => {
                      const current = filters.studyStyle || [];
                      const newStyle = e.target.checked
                        ? [...current, style]
                        : current.filter((s) => s !== style);
                      handleFilterChange('studyStyle', newStyle);
                    }}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize">{style}</span>
                </label>
              ))}
            </div>
          </div>

          {/* School */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              School
            </label>
            <select
              value={filters.school || ''}
              onChange={(e) => handleFilterChange('school', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
            >
              <option value="">All Schools</option>
              <option value="Oregon State University">Oregon State University</option>
            </select>
          </div>

          {/* Graduation Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Graduation Year
            </label>
            <select
              value={filters.graduationYear || ''}
              onChange={(e) => handleFilterChange('graduationYear', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
            >
              <option value="">Any Year</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
              <option value="2028">2028</option>
            </select>
          </div>

          {/* Verification Badges */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification
            </label>
            <div className="space-y-2">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.verifiedEmail || false}
                  onChange={(e) => handleFilterChange('verifiedEmail', e.target.checked)}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-gray-700">Email Verified</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.verifiedStudent || false}
                  onChange={(e) => handleFilterChange('verifiedStudent', e.target.checked)}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-gray-700">Student Verified</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.verifiedId || false}
                  onChange={(e) => handleFilterChange('verifiedId', e.target.checked)}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-gray-700">ID Verified</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoommateFilterPanel;

