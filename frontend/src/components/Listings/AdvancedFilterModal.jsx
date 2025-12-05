import { useState } from 'react';
import { FiX, FiMinus, FiPlus, FiCheck } from 'react-icons/fi';

const AdvancedFilterModal = ({ isOpen, onClose, filters, onApply }) => {
    const [localFilters, setLocalFilters] = useState(filters);

    if (!isOpen) return null;

    const handleApply = () => {
        onApply(localFilters);
        onClose();
    };

    const handleClearAll = () => {
        const clearedFilters = {
            search: localFilters.search,
            priceMin: '',
            priceMax: '',
            bedrooms: '',
            bathrooms: '',
            leaseTerm: '',
            maxDistance: '',
            propertyType: [],
            amenities: [],
            utilitiesIncluded: false,
            petFriendly: false,
            subleaseOnly: false,
            sqftMin: '',
            sqftMax: '',
            furnished: false,
            verifiedLandlordsOnly: false,
        };
        setLocalFilters(clearedFilters);
    };

    // Helper for toggle buttons (Recommended for you)
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

    // Helper for Stepper (Rooms and beds)
    const Stepper = ({ label, value, onChange }) => (
        <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
            <span className="text-base text-gray-700">{label}</span>
            <div className="flex items-center gap-4">
                <button
                    onClick={() => onChange(Math.max(0, (parseInt(value) || 0) - 1))}
                    disabled={!value || value <= 0}
                    className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${!value || value <= 0 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-400 text-gray-600 hover:border-black hover:text-black'
                        }`}
                >
                    <FiMinus size={14} />
                </button>
                <span className="w-4 text-center text-gray-700">{value || 'Any'}</span>
                <button
                    onClick={() => onChange((parseInt(value) || 0) + 1)}
                    className="w-8 h-8 rounded-full border border-gray-400 text-gray-600 flex items-center justify-center hover:border-black hover:text-black transition-colors"
                >
                    <FiPlus size={14} />
                </button>
            </div>
        </div>
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
                    <div className="w-8" /> {/* Spacer for centering */}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-2">

                    {/* Recommended for you */}
                    <section className="py-6 border-b border-gray-200">
                        <h3 className="text-xl font-semibold mb-4">Recommended for you</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <ToggleButton
                                label="Verified Landlord"
                                icon="🛡️"
                                checked={localFilters.verifiedLandlordsOnly}
                                onChange={(val) => setLocalFilters({ ...localFilters, verifiedLandlordsOnly: val })}
                            />
                            <ToggleButton
                                label="Utilities Included"
                                icon="💡"
                                checked={localFilters.utilitiesIncluded}
                                onChange={(val) => setLocalFilters({ ...localFilters, utilitiesIncluded: val })}
                            />
                            <ToggleButton
                                label="Sublease"
                                icon="📅"
                                checked={localFilters.subleaseOnly}
                                onChange={(val) => setLocalFilters({ ...localFilters, subleaseOnly: val })}
                            />
                            <ToggleButton
                                label="Pet Friendly"
                                icon="🐾"
                                checked={localFilters.petFriendly}
                                onChange={(val) => setLocalFilters({ ...localFilters, petFriendly: val })}
                            />
                        </div>
                    </section>

                    {/* Type of place */}
                    <section className="py-6 border-b border-gray-200">
                        <h3 className="text-xl font-semibold mb-4">Type of place</h3>
                        <div className="flex rounded-xl border border-gray-300 overflow-hidden">
                            {['Any type', 'Room', 'Entire home'].map((type) => {
                                const isSelected =
                                    (type === 'Any type' && localFilters.propertyType.length === 0) ||
                                    (type === 'Room' && localFilters.propertyType.includes('shared-room')) ||
                                    (type === 'Entire home' && localFilters.propertyType.includes('house'));

                                return (
                                    <button
                                        key={type}
                                        onClick={() => {
                                            if (type === 'Any type') setLocalFilters({ ...localFilters, propertyType: [] });
                                            if (type === 'Room') setLocalFilters({ ...localFilters, propertyType: ['shared-room'] });
                                            if (type === 'Entire home') setLocalFilters({ ...localFilters, propertyType: ['house', 'apartment', 'condo'] });
                                        }}
                                        className={`flex-1 py-3 text-sm font-medium transition-colors border-r border-gray-300 last:border-0 ${isSelected ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    {/* Price range */}
                    <section className="py-6 border-b border-gray-200">
                        <h3 className="text-xl font-semibold mb-2">Price range</h3>
                        <p className="text-sm text-gray-500 mb-6">Monthly rent, includes all fees</p>

                        <div className="flex items-center gap-4">
                            <div className="flex-1 border border-gray-400 rounded-xl px-3 py-2 relative focus-within:ring-2 focus-within:ring-black focus-within:border-transparent">
                                <label className="text-xs text-gray-500 absolute top-2 left-3">Minimum</label>
                                <div className="flex items-center mt-4">
                                    <span className="text-gray-900 mr-1">$</span>
                                    <input
                                        type="number"
                                        value={localFilters.priceMin}
                                        onChange={(e) => setLocalFilters({ ...localFilters, priceMin: e.target.value })}
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
                                        value={localFilters.priceMax}
                                        onChange={(e) => setLocalFilters({ ...localFilters, priceMax: e.target.value })}
                                        className="w-full outline-none text-gray-900"
                                        placeholder="5000+"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Rooms and beds */}
                    <section className="py-6 border-b border-gray-200">
                        <h3 className="text-xl font-semibold mb-4">Rooms and beds</h3>
                        <Stepper
                            label="Bedrooms"
                            value={localFilters.bedrooms}
                            onChange={(val) => setLocalFilters({ ...localFilters, bedrooms: val })}
                        />
                        <Stepper
                            label="Bathrooms"
                            value={localFilters.bathrooms}
                            onChange={(val) => setLocalFilters({ ...localFilters, bathrooms: val })}
                        />
                    </section>

                    {/* Amenities */}
                    <section className="py-6">
                        <h3 className="text-xl font-semibold mb-4">Amenities</h3>
                        <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                            {[
                                'WiFi', 'Laundry', 'Parking', 'Dishwasher',
                                'AC', 'Heating', 'Gym', 'Pool', 'Furnished'
                            ].map((amenity) => {
                                const isChecked = amenity === 'Furnished'
                                    ? localFilters.furnished
                                    : localFilters.amenities.includes(amenity);

                                return (
                                    <label key={amenity} className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-5 h-5 border rounded flex items-center justify-center transition-colors ${isChecked
                                            ? 'bg-black border-black text-white'
                                            : 'border-gray-400 group-hover:border-black'
                                            }`}>
                                            {isChecked && <FiCheck size={14} />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={isChecked}
                                            onChange={(e) => {
                                                if (amenity === 'Furnished') {
                                                    setLocalFilters({ ...localFilters, furnished: e.target.checked });
                                                } else {
                                                    const newAmenities = e.target.checked
                                                        ? [...localFilters.amenities, amenity]
                                                        : localFilters.amenities.filter(a => a !== amenity);
                                                    setLocalFilters({ ...localFilters, amenities: newAmenities });
                                                }
                                            }}
                                        />
                                        <span className="text-gray-700">{amenity}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white">
                    <button
                        onClick={handleClearAll}
                        className="text-base font-semibold text-gray-900 underline hover:text-gray-600 transition-colors"
                    >
                        Clear all
                    </button>
                    <button
                        onClick={handleApply}
                        className="px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-black transition-colors shadow-sm"
                    >
                        Show places
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdvancedFilterModal;
