import React, { useState, useRef, useEffect } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

// Common university majors list
const MAJORS = [
    'Accounting',
    'Aerospace Engineering',
    'Agriculture',
    'Animal Science',
    'Anthropology',
    'Architecture',
    'Art History',
    'Biochemistry',
    'Biology',
    'Biomedical Engineering',
    'Business Administration',
    'Chemical Engineering',
    'Chemistry',
    'Civil Engineering',
    'Communications',
    'Computer Engineering',
    'Computer Science',
    'Criminal Justice',
    'Data Science',
    'Economics',
    'Education',
    'Electrical Engineering',
    'English',
    'Environmental Science',
    'Finance',
    'Forestry',
    'Geology',
    'Graphic Design',
    'Health Sciences',
    'History',
    'Hospitality Management',
    'Human Development',
    'Industrial Engineering',
    'Information Technology',
    'International Relations',
    'Journalism',
    'Kinesiology',
    'Liberal Arts',
    'Linguistics',
    'Marketing',
    'Mathematics',
    'Mechanical Engineering',
    'Music',
    'Nursing',
    'Nutrition',
    'Philosophy',
    'Physics',
    'Political Science',
    'Pre-Law',
    'Pre-Med',
    'Psychology',
    'Public Health',
    'Social Work',
    'Sociology',
    'Software Engineering',
    'Statistics',
    'Theater',
    'Veterinary Science',
    'Zoology',
];

const MajorAutocomplete = ({
    value,
    onChange,
    label = "",
    placeholder = "Search or type your major...",
    className = "",
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState(value || '');
    const containerRef = useRef(null);

    useEffect(() => {
        setInputValue(value || '');
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredMajors = MAJORS.filter(major =>
        major.toLowerCase().includes(inputValue.toLowerCase())
    ).slice(0, 8);

    const handleInputChange = (e) => {
        const val = e.target.value;
        setInputValue(val);
        onChange?.(val);
        setIsOpen(true);
    };

    const handleSelect = (major) => {
        setInputValue(major);
        onChange?.(major);
        setIsOpen(false);
    };

    const handleClear = () => {
        setInputValue('');
        onChange?.('');
    };

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-10 py-3 border-2 border-gray-300 rounded-xl transition-all duration-200
            hover:border-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-20
            focus:outline-none placeholder:text-gray-400 text-gray-900"
                />
                {inputValue && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <FiX size={18} />
                    </button>
                )}
            </div>

            {isOpen && filteredMajors.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {filteredMajors.map((major) => (
                        <button
                            key={major}
                            type="button"
                            onClick={() => handleSelect(major)}
                            className={`w-full px-4 py-2.5 text-left text-sm hover:bg-orange-50 transition-colors first:rounded-t-xl last:rounded-b-xl
                ${major === inputValue ? 'bg-orange-50 text-orange-700 font-medium' : 'text-gray-700'}
              `}
                        >
                            {major}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export { MAJORS };
export default MajorAutocomplete;
