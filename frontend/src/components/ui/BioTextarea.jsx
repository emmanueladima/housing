import React from 'react';

const BioTextarea = ({
    value,
    onChange,
    label = "Bio",
    placeholder = "Tell us about yourself...",
    maxLength = 500,
    className = "",
    variant = "default", // "default" or "glass"
    ...props
}) => {
    const handleChange = (e) => {
        if (onChange) {
            onChange(e.target.value);
        }
    };

    const baseClasses = "w-full px-4 py-3 rounded-xl transition-all duration-200 resize-none focus:outline-none";

    const variantClasses = variant === "glass"
        ? "bg-white/5 backdrop-blur-md border border-white/10 text-white placeholder-white/30 hover:bg-white/10 focus:bg-white/10 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
        : "bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-400 hover:border-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-20";

    const labelClasses = variant === "glass"
        ? "block text-sm font-medium text-white/70"
        : "block text-sm font-medium text-gray-700";

    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <label className={labelClasses}>
                    {label}
                </label>
            )}
            <textarea
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                maxLength={maxLength}
                rows={3}
                className={`${baseClasses} ${variantClasses}`}
                {...props}
            />
            {value && maxLength && (
                <p className={`text-xs text-right ${variant === "glass" ? "text-white/40" : "text-gray-400"}`}>
                    {value.length}/{maxLength} characters
                </p>
            )}
        </div>
    );
};

export default BioTextarea;
