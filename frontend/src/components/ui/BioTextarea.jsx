import React from 'react';

const BioTextarea = ({
    value,
    onChange,
    label = "Bio",
    placeholder = "Tell us about yourself...",
    maxLength = 500,
    className = "",
    ...props
}) => {
    const handleChange = (e) => {
        if (onChange) {
            onChange(e.target.value);
        }
    };

    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <textarea
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                maxLength={maxLength}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl transition-all duration-200
                    hover:border-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-20
                    focus:outline-none resize-none
                    placeholder:text-gray-400 text-gray-900 bg-white"
                {...props}
            />
            {value && maxLength && (
                <p className="text-xs text-gray-400 text-right">
                    {value.length}/{maxLength} characters
                </p>
            )}
        </div>
    );
};

export default BioTextarea;
