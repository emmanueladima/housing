import React, { useState, useEffect, useRef } from 'react';
import { FiMapPin, FiSearch } from 'react-icons/fi';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const AddressAutocomplete = ({
    value,
    onChange,
    onSelect,
    placeholder = "Search for an address...",
    className = ""
}) => {
    const [query, setQuery] = useState(value || '');
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        setQuery(value || '');
    }, [value]);

    useEffect(() => {
        // Click outside to close suggestions
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchSuggestions = async (searchText) => {
        if (!searchText || searchText.length < 3) {
            setSuggestions([]);
            return;
        }

        setLoading(true);
        try {
            const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchText)}.json`;
            const params = new URLSearchParams({
                access_token: MAPBOX_TOKEN,
                types: 'address',
                country: 'us', // Limit to US for this app
                limit: 5,
                proximity: '-123.2784,44.5669' // Bias towards Corvallis, OR
            });

            const response = await fetch(`${endpoint}?${params}`);
            const data = await response.json();

            if (data.features) {
                setSuggestions(data.features);
            }
        } catch (error) {
            console.error('Error fetching address suggestions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const newVal = e.target.value;
        setQuery(newVal);
        onChange(newVal);

        // Debounce API calls
        const timeoutId = setTimeout(() => {
            fetchSuggestions(newVal);
            setShowSuggestions(true);
        }, 300);

        return () => clearTimeout(timeoutId);
    };

    const handleSelect = (feature) => {
        setQuery(feature.place_name);
        setShowSuggestions(false);

        // Parse address components
        const context = feature.context || [];
        const city = context.find(c => c.id.startsWith('place'))?.text || '';
        const state = context.find(c => c.id.startsWith('region'))?.text || '';
        const zip = context.find(c => c.id.startsWith('postcode'))?.text || '';

        const addressData = {
            fullAddress: feature.place_name,
            street: feature.text + (feature.address ? ` ${feature.address}` : ''),
            city,
            state,
            zipCode: zip,
            coordinates: {
                lng: feature.center[0],
                lat: feature.center[1]
            }
        };

        if (onSelect) {
            onSelect(addressData);
        }
    };

    return (
        <div ref={wrapperRef} className={`relative ${className}`}>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMapPin className="text-gray-400" />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => {
                        if (suggestions.length > 0) setShowSuggestions(true);
                    }}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 sm:text-sm transition duration-150 ease-in-out"
                    placeholder={placeholder}
                    autoComplete="off"
                />
                {loading && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-500 border-t-transparent"></div>
                    </div>
                )}
            </div>

            {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                    {suggestions.map((suggestion) => (
                        <li
                            key={suggestion.id}
                            onClick={() => handleSelect(suggestion)}
                            className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-orange-50 text-gray-900"
                        >
                            <div className="flex items-center">
                                <span className="font-medium block truncate">
                                    {suggestion.place_name}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AddressAutocomplete;
