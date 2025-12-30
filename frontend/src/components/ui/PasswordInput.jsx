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
                <label htmlFor={name} className="block text-sm font-medium text-gray-200">
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
                    className={`w-full px-4 py-3 pr-12 border-2 rounded-xl transition-all duration-200 bg-white/10 backdrop-blur-sm
                        ${error
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                            : 'border-white/20 hover:border-white/40 focus:border-orange-500 focus:ring-orange-500'
                        }
                        focus:outline-none focus:ring-2 focus:ring-opacity-20
                        placeholder:text-gray-400 text-white
                    `}
                    {...props}
                />
                <button
                    type="button"
                    onClick={toggleVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
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
