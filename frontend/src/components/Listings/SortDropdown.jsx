import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiCheck, FiArrowUp, FiArrowDown } from 'react-icons/fi';

const SortDropdown = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const options = [
        { label: 'Price: High to Low', value: 'price-high' },
        { label: 'Price: Low to High', value: 'price-low' },
        { label: 'Most Popular', value: 'popular' },
        { label: 'Newly Added', value: 'newest' },
    ];

    const selectedOption = options.find(opt => opt.value === value) || options[0];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
            >
                {value === 'price-low' && <FiArrowUp size={14} />}
                {value === 'price-high' && <FiArrowDown size={14} />}
                {!(value === 'price-low' || value === 'price-high') && <span className="text-gray-400"><FiArrowUp size={14} className="inline rotate-180" /><FiArrowDown size={14} className="inline -ml-1" /></span>}

                <span>{selectedOption.label}</span>
                <FiChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                    {options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleSelect(option.value)}
                            className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center justify-between group transition-colors"
                        >
                            <span className={`${value === option.value ? 'font-semibold text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                {option.label}
                            </span>
                            {value === option.value && (
                                <FiCheck size={16} className="text-gray-900" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SortDropdown;
