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
                <label htmlFor={name} className="block text-sm font-medium text-gray-700">
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
                className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200
                    ${error
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 hover:border-gray-400 focus:border-orange-500 focus:ring-orange-500'
                    }
                    focus:outline-none focus:ring-2 focus:ring-opacity-20
                    placeholder:text-gray-400 text-gray-900
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
