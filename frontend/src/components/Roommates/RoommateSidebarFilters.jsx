import { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiFilter, FiCheck } from 'react-icons/fi';

const FilterSection = ({ title, isOpen, onToggle, children }) => (
    <div className="border-b border-gray-200 py-4">
        <button
            onClick={onToggle}
            className="flex items-center justify-between w-full text-left mb-2 group"
        >
            <span className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{title}</span>
            {isOpen ? <FiChevronUp className="text-gray-400" /> : <FiChevronDown className="text-gray-400" />}
        </button>
        {isOpen && <div className="mt-2 space-y-3 animate-in slide-in-from-top-2 duration-200">{children}</div>}
    </div>
);

const PillOption = ({ label, selected, onClick }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${selected
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
            }`}
    >
        {label}
    </button>
);

const RoommateSidebarFilters = ({ filters, onFilterChange }) => {
    const [openSections, setOpenSections] = useState({
        budget: true,
        lifestyle: true,
        habits: true,
        moveIn: false
    });

    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const updateFilter = (key, value) => {
        onFilterChange({ ...filters, [key]: value });
    };

    const toggleArrayFilter = (key, value) => {
        const current = filters[key] || [];
        const newArray = current.includes(value)
            ? current.filter(item => item !== value)
            : [...current, value];
        updateFilter(key, newArray);
    };

    return (
        <div className="w-80 flex-shrink-0 bg-white border-r border-gray-200 h-[calc(100vh-64px)] overflow-y-auto sticky top-16 p-6 hidden lg:block">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                    <FiFilter size={18} /> Filters
                </h2>
                <button
                    onClick={() => onFilterChange({})} // Clear all
                    className="text-sm text-gray-500 hover:text-black font-medium underline decoration-gray-300 hover:decoration-black"
                >
                    Reset
                </button>
            </div>

            {/* Budget Section */}
            <FilterSection
                title="Budget"
                isOpen={openSections.budget}
                onToggle={() => toggleSection('budget')}
            >
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                            <input
                                type="number"
                                placeholder="Min"
                                value={filters.budgetMin || ''}
                                onChange={(e) => updateFilter('budgetMin', e.target.value)}
                                className="w-full pl-6 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-black focus:border-black outline-none"
                            />
                        </div>
                        <span className="text-gray-400">-</span>
                        <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                            <input
                                type="number"
                                placeholder="Max"
                                value={filters.budgetMax || ''}
                                onChange={(e) => updateFilter('budgetMax', e.target.value)}
                                className="w-full pl-6 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-black focus:border-black outline-none"
                            />
                        </div>
                    </div>
                </div>
            </FilterSection>

            {/* Lifestyle Section */}
            <FilterSection
                title="Lifestyle"
                isOpen={openSections.lifestyle}
                onToggle={() => toggleSection('lifestyle')}
            >
                <div>
                    <label className="text-xs font-semibold text-gray-500 mb-2 block">Gender Preference</label>
                    <div className="flex flex-wrap gap-2">
                        {['Male', 'Female', 'Non-binary', 'Any'].map(opt => (
                            <PillOption
                                key={opt}
                                label={opt}
                                selected={filters.gender === opt}
                                onClick={() => updateFilter('gender', opt)}
                            />
                        ))}
                    </div>
                </div>

                <div className="mt-4">
                    <label className="text-xs font-semibold text-gray-500 mb-2 block">Major / Field</label>
                    <input
                        type="text"
                        placeholder="e.g. Engineering, Arts..."
                        value={filters.major || ''}
                        onChange={(e) => updateFilter('major', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-black focus:border-black outline-none"
                    />
                </div>
            </FilterSection>

            {/* Habits Section */}
            <FilterSection
                title="Habits"
                isOpen={openSections.habits}
                onToggle={() => toggleSection('habits')}
            >
                <div>
                    <label className="text-xs font-semibold text-gray-500 mb-2 block">Cleanliness</label>
                    <input
                        type="range"
                        min="1"
                        max="5"
                        value={filters.cleanliness || 3}
                        onChange={(e) => updateFilter('cleanliness', e.target.value)}
                        className="w-full accent-black h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Relaxed</span>
                        <span>Spotless</span>
                    </div>
                </div>

                <div className="mt-4">
                    <label className="text-xs font-semibold text-gray-500 mb-2 block">Sleep Schedule</label>
                    <div className="flex flex-wrap gap-2">
                        {['Early Bird', 'Night Owl', 'Flexible'].map(opt => (
                            <PillOption
                                key={opt}
                                label={opt}
                                selected={(filters.sleepSchedule || []).includes(opt)}
                                onClick={() => toggleArrayFilter('sleepSchedule', opt)}
                            />
                        ))}
                    </div>
                </div>

                <div className="mt-4 space-y-2">
                    <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-sm text-gray-700 group-hover:text-black">Smoking Allowed</span>
                        <div
                            onClick={() => updateFilter('smoking', !filters.smoking)}
                            className={`w-10 h-5 rounded-full relative transition-colors ${filters.smoking ? 'bg-black' : 'bg-gray-200'}`}
                        >
                            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-transform ${filters.smoking ? 'left-6' : 'left-1'}`} />
                        </div>
                    </label>

                    <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-sm text-gray-700 group-hover:text-black">Pet Friendly</span>
                        <div
                            onClick={() => updateFilter('pets', !filters.pets)}
                            className={`w-10 h-5 rounded-full relative transition-colors ${filters.pets ? 'bg-black' : 'bg-gray-200'}`}
                        >
                            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-transform ${filters.pets ? 'left-6' : 'left-1'}`} />
                        </div>
                    </label>
                </div>
            </FilterSection>
        </div>
    );
};

export default RoommateSidebarFilters;
