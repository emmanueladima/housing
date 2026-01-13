import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiUsers, FiCheck, FiX, FiLock, FiLoader } from 'react-icons/fi';
import roommateGroupService from '../services/roommateGroupService';
import ModernBackground from '../components/shared/ModernBackground';
import { useAuth } from '../contexts/AuthContext';

/**
 * Page for joining a group via invite code
 * Route: /join/:code
 */
const JoinByCode = () => {
    const { code } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [status, setStatus] = useState('loading'); // loading | success | error | needsLogin
    const [message, setMessage] = useState('');
    const [group, setGroup] = useState(null);

    useEffect(() => {
        if (!code) {
            setStatus('error');
            setMessage('No invite code provided');
            return;
        }

        if (!isAuthenticated) {
            setStatus('needsLogin');
            setMessage('Please log in to join this group');
            return;
        }

        joinGroup();
    }, [code, isAuthenticated]);

    const joinGroup = async () => {
        setStatus('loading');
        try {
            const result = await roommateGroupService.joinByInviteCode(code);
            setStatus('success');
            setMessage(result.message);
            setGroup(result.group);
        } catch (error) {
            setStatus('error');
            setMessage(error.response?.data?.message || 'Failed to join group');
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="relative overflow-hidden min-h-screen flex items-center justify-center">
                <ModernBackground />

                <div className="relative z-10 w-full max-w-md mx-4">
                    <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-2xl text-center">
                        {/* Icon */}
                        <div className={`w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center ${status === 'success' ? 'bg-green-100' :
                                status === 'error' ? 'bg-red-100' :
                                    status === 'needsLogin' ? 'bg-yellow-100' :
                                        'bg-white/20'
                            }`}>
                            {status === 'loading' && (
                                <FiLoader className="text-white animate-spin" size={36} />
                            )}
                            {status === 'success' && (
                                <FiCheck className="text-green-600" size={36} />
                            )}
                            {status === 'error' && (
                                <FiX className="text-red-600" size={36} />
                            )}
                            {status === 'needsLogin' && (
                                <FiLock className="text-yellow-600" size={36} />
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl font-black text-white mb-2">
                            {status === 'loading' && 'Joining Group...'}
                            {status === 'success' && 'Welcome!'}
                            {status === 'error' && 'Oops!'}
                            {status === 'needsLogin' && 'Login Required'}
                        </h1>

                        {/* Message */}
                        <p className="text-white/80 mb-6">
                            {message}
                        </p>

                        {/* Code Display */}
                        {code && status !== 'success' && (
                            <div className="bg-white/10 rounded-xl p-3 mb-6">
                                <p className="text-xs text-white/60">Invite Code</p>
                                <p className="text-xl font-black text-white tracking-widest">{code.toUpperCase()}</p>
                            </div>
                        )}

                        {/* Group Preview (on success) */}
                        {status === 'success' && group && (
                            <div className="bg-white/10 rounded-xl p-4 mb-6">
                                <p className="text-sm text-white/60 mb-2">You joined</p>
                                <p className="text-xl font-bold text-white">{group.name}</p>
                                <p className="text-sm text-white/60 mt-1">
                                    {group.members?.length || 1} members
                                </p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3">
                            {status === 'success' && (
                                <button
                                    onClick={() => navigate('/group/dashboard')}
                                    className="w-full py-4 bg-white text-gray-900 rounded-2xl font-bold hover:bg-gray-100 transition-all shadow-lg"
                                >
                                    Go to Group Dashboard
                                </button>
                            )}

                            {status === 'needsLogin' && (
                                <>
                                    <button
                                        onClick={() => navigate(`/?redirect=/join/${code}`)}
                                        className="w-full py-4 bg-white text-gray-900 rounded-2xl font-bold hover:bg-gray-100 transition-all shadow-lg"
                                    >
                                        Log In
                                    </button>
                                    <button
                                        onClick={() => navigate(`/?signup=true&redirect=/join/${code}`)}
                                        className="w-full py-3 bg-white/10 text-white rounded-2xl font-bold hover:bg-white/20 transition-all border border-white/30"
                                    >
                                        Sign Up
                                    </button>
                                </>
                            )}

                            {status === 'error' && (
                                <button
                                    onClick={() => navigate('/roommates')}
                                    className="w-full py-4 bg-white text-gray-900 rounded-2xl font-bold hover:bg-gray-100 transition-all shadow-lg"
                                >
                                    Find Groups
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JoinByCode;
