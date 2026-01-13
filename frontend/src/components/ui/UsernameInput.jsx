import React, { useState, useEffect, useCallback } from 'react';
import { FiCheck, FiX, FiLoader, FiAtSign } from 'react-icons/fi';
import userService from '../../services/userService';

/**
 * UsernameInput - A reusable component for setting/updating username
 * with real-time availability checking
 * @param variant - 'dark' (default) for dark backgrounds, 'light' for light backgrounds
 */
const UsernameInput = ({
    currentUsername = '',
    onUsernameSet,
    className = '',
    showLabel = true,
    variant = 'dark' // 'dark' for dark backgrounds, 'light' for light backgrounds
}) => {
    const [username, setUsername] = useState(currentUsername);
    const [isChecking, setIsChecking] = useState(false);
    const [isAvailable, setIsAvailable] = useState(null);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const isLight = variant === 'light';

    // Debounced availability check
    useEffect(() => {
        if (!username || username === currentUsername) {
            setIsAvailable(null);
            setError('');
            return;
        }

        // Validate format first
        if (username.length < 3) {
            setError('Username must be at least 3 characters');
            setIsAvailable(false);
            return;
        }

        if (username.length > 20) {
            setError('Username cannot exceed 20 characters');
            setIsAvailable(false);
            return;
        }

        if (!/^[a-z0-9._]+$/i.test(username)) {
            setError('Only letters, numbers, dots and underscores allowed');
            setIsAvailable(false);
            return;
        }

        const timer = setTimeout(async () => {
            setIsChecking(true);
            setError('');
            try {
                const result = await userService.checkUsername(username);
                setIsAvailable(result.available);
                if (!result.available) {
                    setError('Username is already taken');
                }
            } catch (err) {
                setError(err.response?.data?.error || 'Error checking username');
                setIsAvailable(false);
            } finally {
                setIsChecking(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [username, currentUsername]);

    const handleSave = async () => {
        if (!isAvailable || isSaving) return;

        setIsSaving(true);
        try {
            const result = await userService.setUsername(username);
            setSaved(true);
            if (onUsernameSet) {
                onUsernameSet(result.user.username);
            }
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Error setting username');
        } finally {
            setIsSaving(false);
        }
    };

    const getStatusIcon = () => {
        if (isChecking) {
            return <FiLoader className={`animate-spin ${isLight ? 'text-gray-400' : 'text-white/50'}`} size={16} />;
        }
        if (isAvailable === true) {
            return <FiCheck className="text-green-500" size={16} />;
        }
        if (isAvailable === false) {
            return <FiX className="text-red-500" size={16} />;
        }
        return null;
    };

    // Styling classes based on variant
    const inputClasses = isLight
        ? `w-full pl-9 pr-10 py-3 bg-gray-100 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all ${error ? 'border-red-400' : isAvailable ? 'border-green-400' : 'border-gray-200'
        }`
        : `w-full pl-9 pr-10 py-3 bg-white/10 border rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${error ? 'border-red-400/50' : isAvailable ? 'border-green-400/50' : 'border-white/20'
        }`;

    const iconClasses = isLight ? 'text-gray-400' : 'text-white/50';
    const labelClasses = isLight ? 'text-gray-700' : 'text-white/80';
    const helperSuccessClasses = isLight ? 'text-green-600' : 'text-green-400';
    const helperErrorClasses = isLight ? 'text-red-600' : 'text-red-400';
    const helperMutedClasses = isLight ? 'text-gray-500' : 'text-white/50';

    return (
        <div className={`${className}`}>
            {showLabel && (
                <label className={`block text-sm font-bold mb-2 ${labelClasses}`}>
                    Username
                </label>
            )}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${iconClasses}`}>
                        <FiAtSign size={16} />
                    </div>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => {
                            setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ''));
                            setSaved(false);
                        }}
                        placeholder="username"
                        className={inputClasses}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {getStatusIcon()}
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={!isAvailable || isSaving || saved || username === currentUsername}
                    className={`px-4 py-3 rounded-xl font-bold text-sm transition-all ${saved
                            ? 'bg-green-500 text-white'
                            : isAvailable && username !== currentUsername
                                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                                : isLight
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-white/10 text-white/40 cursor-not-allowed'
                        }`}
                >
                    {isSaving ? '...' : saved ? '✓' : 'Save'}
                </button>
            </div>
            {error && (
                <p className={`${helperErrorClasses} text-xs mt-1`}>{error}</p>
            )}
            {isAvailable && !error && username !== currentUsername && (
                <p className={`${helperSuccessClasses} text-xs mt-1`}>Username is available!</p>
            )}
            {currentUsername && !username && (
                <p className={`${helperMutedClasses} text-xs mt-1`}>Current: @{currentUsername}</p>
            )}
        </div>
    );
};

export default UsernameInput;
