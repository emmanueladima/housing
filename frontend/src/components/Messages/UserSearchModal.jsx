import React, { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiX, FiUser, FiMessageCircle } from 'react-icons/fi';
import { Spinner } from '@heroui/react';
import userService from '../../services/userService';

const UserSearchModal = ({ isOpen, onClose, onSelectUser }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Debounced search
    useEffect(() => {
        if (!query || query.length < 2) {
            setResults([]);
            return;
        }

        const debounceTimer = setTimeout(async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await userService.searchUsers(query);
                setResults(data.users || []);
            } catch (err) {
                console.error('Search error:', err);
                setError('Failed to search users');
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [query]);

    const handleSelect = (user) => {
        onSelectUser(user);
        onClose();
        setQuery('');
        setResults([]);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-gray-900/95 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h2 className="text-lg font-bold text-white">New Message</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* Search Input */}
                <div className="p-4">
                    <div className="relative">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by name or username..."
                            autoFocus
                            className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-orange-500 transition-colors"
                        />
                    </div>
                </div>

                {/* Results */}
                <div className="max-h-80 overflow-y-auto px-4 pb-4">
                    {loading && (
                        <div className="flex justify-center py-8">
                            <Spinner color="warning" size="md" />
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-8 text-red-400">
                            {error}
                        </div>
                    )}

                    {!loading && !error && query.length >= 2 && results.length === 0 && (
                        <div className="text-center py-8 text-white/50">
                            No users found matching "{query}"
                        </div>
                    )}

                    {!loading && results.length > 0 && (
                        <div className="space-y-2">
                            {results.map((user) => (
                                <button
                                    key={user._id}
                                    onClick={() => handleSelect(user)}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/20 transition-all text-left group"
                                >
                                    {/* Avatar */}
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
                                        {user.profilePhoto ? (
                                            <img
                                                src={user.profilePhoto}
                                                alt={user.firstName}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span>{user.firstName?.charAt(0) || ''}{user.lastName?.charAt(0) || ''}</span>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-white truncate">
                                            {user.firstName} {user.lastName}
                                        </p>
                                        {user.username && (
                                            <p className="text-sm text-white/50 truncate">
                                                @{user.username}
                                            </p>
                                        )}
                                    </div>

                                    {/* Action hint */}
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <FiMessageCircle className="text-orange-400" size={20} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {!loading && query.length < 2 && (
                        <div className="text-center py-8 text-white/40">
                            <FiUser size={32} className="mx-auto mb-3 opacity-50" />
                            <p>Type at least 2 characters to search</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserSearchModal;
