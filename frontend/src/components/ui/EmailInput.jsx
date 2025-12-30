import React from 'react';

const EmailInput = ({
    label = "Email",
    placeholder = "m@example.com",
    value,
    onChange,
    name = "email",
    error,
    required = false,
    className = "",
    ...props
}) => {
    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <label htmlFor={name} className="block text-sm font-medium text-gray-200">
                    {label}
                </label>
            )}
            <input
                id={name}
                type="email"
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 bg-white/10 backdrop-blur-sm
                    ${error
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-white/20 hover:border-white/40 focus:border-orange-500 focus:ring-orange-500'
                    }
                    focus:outline-none focus:ring-2 focus:ring-opacity-20
                    placeholder:text-gray-400 text-white
                `}
                {...props}
            />
            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}
        </div>
    );
};

export default EmailInput;
