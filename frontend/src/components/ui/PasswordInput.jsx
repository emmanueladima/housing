import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const PasswordInput = ({
    label = "Password",
    placeholder = "Enter your password",
    value,
    onChange,
    name = "password",
    error,
    required = false,
    className = "",
    ...props
}) => {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => setIsVisible(!isVisible);

    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <label htmlFor={name} className="block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    id={name}
                    type={isVisible ? "text" : "password"}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    className={`w-full px-4 py-3 pr-12 border-2 rounded-xl transition-all duration-200
                        ${error
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                            : 'border-gray-300 hover:border-gray-400 focus:border-orange-500 focus:ring-orange-500'
                        }
                        focus:outline-none focus:ring-2 focus:ring-opacity-20
                        placeholder:text-gray-400 text-gray-900
                    `}
                    {...props}
                />
                <button
                    type="button"
                    onClick={toggleVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={isVisible ? "Hide password" : "Show password"}
                >
                    {isVisible ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
            </div>
            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}
        </div>
    );
};

export default PasswordInput;
