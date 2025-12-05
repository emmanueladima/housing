import { useState } from 'react';
import { FiX, FiMinus, FiPlus, FiCheck } from 'react-icons/fi';

const RoommateFilterModal = ({ isOpen, onClose, filters, onApply }) => {
    const [localFilters, setLocalFilters] = useState(filters);

    if (!isOpen) return null;

    const handleApply = () => {
        onApply(localFilters);
        onClose();
    };

    const handleClearAll = () => {
        setLocalFilters({});
    };

    // Helper for toggle buttons
    const ToggleButton = ({ label, icon, checked, onChange }) => (
        <button
            onClick={() => onChange(!checked)}
            className={`flex flex-col items-start justify-between p-4 border rounded-xl transition-all h-32 w-full ${checked ? 'border-black bg-gray-50 ring-1 ring-black' : 'border-gray-200 hover:border-gray-400'
                }`}
        >
            <span className="text-3xl mb-2">{icon}</span>
            <span className="font-medium text-sm text-left">{label}</span>
        </button>
    );

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <button onClick={onClose} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
                        <FiX size={20} />
                    </button>
                    <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                    <div className="w-8" />
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-2">

                    {/* Recommended */}
                    <section className="py-6 border-b border-gray-200">
                        <h3 className="text-xl font-semibold mb-4">Recommended</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <ToggleButton
                                label="Verified Student"
                                icon="🎓"
                                checked={localFilters.verifiedStudent}
                                onChange={(val) => setLocalFilters({ ...localFilters, verifiedStudent: val })}
                            />
                            <ToggleButton
                                label="Has Profile"
                                icon="📋"
                                checked={localFilters.hasProfile}
                                onChange={(val) => setLocalFilters({ ...localFilters, hasProfile: val })}
                            />
                            <ToggleButton
                                label="High Match"
                                icon="✨"
                                checked={localFilters.highMatch}
                                onChange={(val) => setLocalFilters({ ...localFilters, highMatch: val })}
                            />
                        </div>
                    </section>

                    {/* Budget */}
                    <section className="py-6 border-b border-gray-200">
                        <h3 className="text-xl font-semibold mb-2">Budget</h3>
                        <p className="text-sm text-gray-500 mb-6">Monthly rent share</p>

                        <div className="flex items-center gap-4">
                            <div className="flex-1 border border-gray-400 rounded-xl px-3 py-2 relative focus-within:ring-2 focus-within:ring-black focus-within:border-transparent">
                                <label className="text-xs text-gray-500 absolute top-2 left-3">Minimum</label>
                                <div className="flex items-center mt-4">
                                    <span className="text-gray-900 mr-1">$</span>
                                    <input
                                        type="number"
                                        value={localFilters.budgetMin || ''}
                                        onChange={(e) => setLocalFilters({ ...localFilters, budgetMin: e.target.value })}
                                        className="w-full outline-none text-gray-900"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <span className="text-gray-400">-</span>
                            <div className="flex-1 border border-gray-400 rounded-xl px-3 py-2 relative focus-within:ring-2 focus-within:ring-black focus-within:border-transparent">
                                <label className="text-xs text-gray-500 absolute top-2 left-3">Maximum</label>
                                <div className="flex items-center mt-4">
                                    <span className="text-gray-900 mr-1">$</span>
                                    <input
                                        type="number"
                                        value={localFilters.budgetMax || ''}
                                        onChange={(e) => setLocalFilters({ ...localFilters, budgetMax: e.target.value })}
                                        className="w-full outline-none text-gray-900"
                                        placeholder="2000+"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Lifestyle */}
                    <section className="py-6 border-b border-gray-200">
                        <h3 className="text-xl font-semibold mb-4">Lifestyle & Background</h3>

                        <div className="mb-6">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Gender Preference</label>
                            <div className="flex flex-wrap gap-2">
                                {['Male', 'Female', 'Non-binary', 'Any'].map((gender) => (
                                    <button
                                        key={gender}
                                        onClick={() => setLocalFilters({ ...localFilters, gender })}
                                        className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${localFilters.gender === gender
                                                ? 'bg-black text-white border-black'
                                                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                                            }`}
                                    >
                                        {gender}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">Year</label>
                                <select
                                    value={localFilters.year || ''}
                                    onChange={(e) => setLocalFilters({ ...localFilters, year: e.target.value })}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-black"
                                >
                                    <option value="">Any Year</option>
                                    <option value="Freshman">Freshman</option>
                                    <option value="Sophomore">Sophomore</option>
                                    <option value="Junior">Junior</option>
                                    <option value="Senior">Senior</option>
                                    <option value="Grad Student">Grad Student</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">Major</label>
                                <input
                                    type="text"
                                    placeholder="e.g. CS, Bio..."
                                    value={localFilters.major || ''}
                                    onChange={(e) => setLocalFilters({ ...localFilters, major: e.target.value })}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-black"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Sleep Schedule</label>
                            <div className="flex flex-wrap gap-2">
                                {['Early Bird', 'Night Owl', 'Flexible'].map((schedule) => {
                                    const isSelected = (localFilters.sleepSchedule || []).includes(schedule);
                                    return (
                                        <button
                                            key={schedule}
                                            onClick={() => {
                                                const current = localFilters.sleepSchedule || [];
                                                const newSchedule = isSelected
                                                    ? current.filter(s => s !== schedule)
                                                    : [...current, schedule];
                                                setLocalFilters({ ...localFilters, sleepSchedule: newSchedule });
                                            }}
                                            className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${isSelected
                                                    ? 'bg-black text-white border-black'
                                                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                                                }`}
                                        >
                                            {schedule}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    {/* Habits */}
                    <section className="py-6">
                        <h3 className="text-xl font-semibold mb-4">Habits</h3>

                        <div className="mb-6">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Cleanliness</label>
                            <input
                                type="range"
                                min="1"
                                max="5"
                                value={localFilters.cleanliness || 3}
                                onChange={(e) => setLocalFilters({ ...localFilters, cleanliness: e.target.value })}
                                className="w-full accent-black h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                                <span>Relaxed</span>
                                <span>Spotless</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-base text-gray-700">Smoking Allowed</span>
                                <div
                                    onClick={() => setLocalFilters({ ...localFilters, smoking: !localFilters.smoking })}
                                    className={`w-12 h-6 rounded-full relative transition-colors ${localFilters.smoking ? 'bg-black' : 'bg-gray-200'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${localFilters.smoking ? 'left-7' : 'left-1'}`} />
                                </div>
                            </label>

                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-base text-gray-700">Pet Friendly</span>
                                <div
                                    onClick={() => setLocalFilters({ ...localFilters, pets: !localFilters.pets })}
                                    className={`w-12 h-6 rounded-full relative transition-colors ${localFilters.pets ? 'bg-black' : 'bg-gray-200'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${localFilters.pets ? 'left-7' : 'left-1'}`} />
                                </div>
                            </label>
                        </div>
                    </section>

                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-6 flex items-center justify-between bg-white rounded-b-xl">
                    <button
                        onClick={handleClearAll}
                        className="text-sm font-semibold text-gray-900 underline hover:text-gray-600"
                    >
                        Clear all
                    </button>
                    <button
                        onClick={handleApply}
                        className="px-8 py-3 bg-black text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        Show Roommates
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoommateFilterModal;
