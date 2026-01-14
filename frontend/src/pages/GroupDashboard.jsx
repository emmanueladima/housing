import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiUsers, FiCheck, FiX, FiMail, FiClock, FiUserPlus, FiBell,
    FiArrowLeft, FiSettings, FiDollarSign, FiCopy, FiRefreshCw,
    FiLink, FiAtSign, FiShare2
} from 'react-icons/fi';
import roommateGroupService from '../services/roommateGroupService';
import ModernBackground from '../components/shared/ModernBackground';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

const GroupDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [group, setGroup] = useState(null);
    const [joinRequests, setJoinRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [activeTab, setActiveTab] = useState('requests');
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState({ budget: '', lookingFor: '', description: '' });

    // Invite states
    const [inviteUsername, setInviteUsername] = useState('');
    const [inviteLoading, setInviteLoading] = useState(false);
    const [inviteError, setInviteError] = useState('');
    const [inviteSuccess, setInviteSuccess] = useState('');
    const [codeLoading, setCodeLoading] = useState(false);
    const [codeCopied, setCodeCopied] = useState(false);

    useEffect(() => {
        loadGroupData();
    }, []);

    useEffect(() => {
        if (group) {
            setEditData({
                budget: group.budget?.max || group.budget || '',
                lookingFor: parseInt(group.lookingFor) || '',
                description: group.description || ''
            });
        }
    }, [group]);

    const handleUpdateGroup = async (e) => {
        e.preventDefault();
        try {
            await roommateGroupService.updateGroup(group._id, {
                budget: { min: 0, max: parseInt(editData.budget) },
                lookingFor: editData.lookingFor + ' more',
                description: editData.description
            });
            setShowEditModal(false);
            loadGroupData();
        } catch (error) {
            console.error('Error updating group:', error);
            alert('Failed to update group');
        }
    };

    const loadGroupData = async () => {
        setLoading(true);
        try {
            const groupData = await roommateGroupService.getMyGroup();
            setGroup(groupData);

            // Load join requests if user is admin
            if (groupData.admin === user?._id || groupData.admin?._id === user?._id) {
                const requests = await roommateGroupService.getJoinRequests(groupData._id);
                setJoinRequests(requests);
            }
        } catch (error) {
            console.error('Error loading group data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRequest = async (requestId, action) => {
        setProcessingId(requestId);
        try {
            await roommateGroupService.handleJoinRequest(group._id, requestId, action);
            // Refresh data
            await loadGroupData();
        } catch (error) {
            console.error(`Error ${action}ing request:`, error);
            alert(`Failed to ${action} request. Please try again.`);
        } finally {
            setProcessingId(null);
        }
    };

    // Invite by username
    const handleInviteByUsername = async (e) => {
        e.preventDefault();
        if (!inviteUsername.trim()) return;

        setInviteLoading(true);
        setInviteError('');
        setInviteSuccess('');

        try {
            const result = await roommateGroupService.inviteByUsername(group._id, inviteUsername);
            setInviteSuccess(result.message);
            setInviteUsername('');
            setGroup(result.group);
            setTimeout(() => setInviteSuccess(''), 3000);
        } catch (error) {
            setInviteError(error.response?.data?.message || 'Failed to invite user');
        } finally {
            setInviteLoading(false);
        }
    };

    // Generate invite code
    const handleGenerateInviteCode = async () => {
        setCodeLoading(true);
        try {
            const result = await roommateGroupService.generateInviteCode(group._id, 7);
            setGroup(prev => ({
                ...prev,
                inviteCode: result.inviteCode
            }));
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to generate invite code');
        } finally {
            setCodeLoading(false);
        }
    };

    // Copy invite code
    const handleCopyCode = () => {
        if (group?.inviteCode?.code) {
            navigator.clipboard.writeText(group.inviteCode.code);
            setCodeCopied(true);
            setTimeout(() => setCodeCopied(false), 2000);
        }
    };

    // Copy invite link
    const handleCopyLink = () => {
        if (group?.inviteCode?.code) {
            const link = `${window.location.origin}/join/${group.inviteCode.code}`;
            navigator.clipboard.writeText(link);
            setCodeCopied(true);
            setTimeout(() => setCodeCopied(false), 2000);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!group) {
        return (
            <div className="min-h-screen bg-white">
                <div className="relative overflow-hidden min-h-[60vh] flex items-center">
                    <ModernBackground />
                    <div className="relative z-10 w-full text-center px-6">
                        <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/30">
                            <FiUsers className="text-white" size={40} />
                        </div>
                        <h1 className="text-4xl font-black text-white mb-4">No Group Yet</h1>
                        <p className="text-white/80 text-lg mb-8 max-w-md mx-auto">
                            Create or join a group to access the dashboard.
                        </p>
                        <button
                            onClick={() => navigate('/roommates')}
                            className="px-8 py-4 bg-white text-gray-900 rounded-2xl font-bold hover:bg-gray-100 transition-all shadow-2xl hover:-translate-y-0.5"
                        >
                            Find Groups
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const isAdmin = group.admin === user?._id || group.admin?._id === user?._id;

    return (
        <div className="min-h-screen relative">
            {/* Full-page animated background */}
            <div className="fixed inset-0 z-0">
                <ModernBackground />
            </div>

            {/* Hero Header */}
            <div className="relative z-10 pt-32 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <button
                        onClick={() => navigate('/roommate-toolkit')}
                        className="flex items-center gap-2 text-white/80 hover:text-white mb-6 font-medium transition-colors"
                    >
                        <FiArrowLeft size={18} />
                        Back to Toolkit
                    </button>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-4xl font-black text-white tracking-tight">{group.name}</h1>
                                {isAdmin && (
                                    <>
                                        <span className="px-3 py-1 bg-yellow-400/20 text-yellow-200 text-xs font-bold rounded-full uppercase tracking-wide backdrop-blur-md border border-yellow-400/30">
                                            Admin
                                        </span>
                                        <button
                                            onClick={() => setShowEditModal(true)}
                                            className="ml-2 p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                                            title="Edit Group Details"
                                        >
                                            <FiSettings size={18} />
                                        </button>
                                    </>
                                )}
                            </div>
                            <p className="text-white/80 text-lg">
                                Manage your group and review join requests
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-4">
                            <div className="bg-white/20 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/30">
                                <p className="text-white/70 text-xs font-bold uppercase">Members</p>
                                <p className="text-white text-2xl font-black">{group.members?.length || 0}</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/30">
                                <p className="text-white/70 text-xs font-bold uppercase">Requests</p>
                                <p className="text-white text-2xl font-black">{joinRequests.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content - extends over the animated background */}
            <div className="relative z-10 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Tabs */}
                    <div className="flex flex-wrap gap-3 mb-8">
                        <button
                            onClick={() => setActiveTab('requests')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold transition-all ${activeTab === 'requests'
                                ? 'bg-white text-gray-900 shadow-lg'
                                : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/20'
                                }`}
                        >
                            <FiUserPlus size={18} />
                            Join Requests
                            {joinRequests.length > 0 && (
                                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'requests' ? 'bg-orange-500 text-white' : 'bg-orange-400/30 text-orange-200'
                                    }`}>
                                    {joinRequests.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('members')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold transition-all ${activeTab === 'members'
                                ? 'bg-white text-gray-900 shadow-lg'
                                : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/20'
                                }`}
                        >
                            <FiUsers size={18} />
                            Members
                        </button>
                        {isAdmin && (
                            <button
                                onClick={() => setActiveTab('invite')}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold transition-all ${activeTab === 'invite'
                                    ? 'bg-white text-gray-900 shadow-lg'
                                    : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/20'
                                    }`}
                            >
                                <FiShare2 size={18} />
                                Invite Members
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    {activeTab === 'requests' ? (
                        <div className="space-y-4">
                            {!isAdmin ? (
                                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 text-center">
                                    <FiSettings className="text-white/30 mx-auto mb-4" size={48} />
                                    <p className="text-white/70 font-medium">Only the group admin can manage join requests.</p>
                                </div>
                            ) : joinRequests.length === 0 ? (
                                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 border border-white/20 text-center">
                                    <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <FiBell className="text-orange-400" size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">No pending requests</h3>
                                    <p className="text-white/60">
                                        When someone requests to join your group, they'll appear here.
                                    </p>
                                </div>
                            ) : (
                                joinRequests.map((request) => (
                                    <div
                                        key={request._id}
                                        className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-orange-200 transition-colors"
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-xl">
                                                    {request.user?.firstName?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-lg">
                                                        {request.user?.firstName} {request.user?.lastName}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        {request.user?.major || 'Student'} • {request.user?.email}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                                                        <FiClock size={12} />
                                                        <span>Requested {new Date(request.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => handleRequest(request._id, 'reject')}
                                                    disabled={processingId === request._id}
                                                    className="p-3 rounded-xl border-2 border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-50"
                                                >
                                                    <FiX size={20} />
                                                </button>
                                                <button
                                                    onClick={() => handleRequest(request._id, 'accept')}
                                                    disabled={processingId === request._id}
                                                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50"
                                                >
                                                    {processingId === request._id ? (
                                                        <LoadingSpinner size="sm" />
                                                    ) : (
                                                        <>
                                                            <FiCheck size={18} />
                                                            Accept
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {request.message && (
                                            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                                                <p className="text-sm text-gray-600 italic">"{request.message}"</p>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    ) : activeTab === 'members' ? (
                        <div className="space-y-4">
                            {group.members?.length === 0 ? (
                                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 border border-white/20 text-center">
                                    <FiUsers className="text-white/30 mx-auto mb-4" size={48} />
                                    <p className="text-white/60">No members yet.</p>
                                </div>
                            ) : (
                                group.members.map((member, i) => (
                                    <div
                                        key={member._id || i}
                                        className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 flex items-center gap-4"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                                            {member.avatar ? (
                                                <img src={member.avatar} alt={member.firstName} className="w-full h-full object-cover" />
                                            ) : (
                                                member.firstName?.charAt(0) || '?'
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-white">
                                                {member.firstName} {member.lastName}
                                            </h3>
                                            <p className="text-sm text-white/60">{member.email}</p>
                                        </div>
                                        {(group.admin === member._id || group.admin?._id === member._id) && (
                                            <span className="px-3 py-1 bg-orange-500/20 text-orange-300 text-xs font-bold rounded-full border border-orange-500/30">
                                                Admin
                                            </span>
                                        )}
                                        <button
                                            onClick={() => navigate(`/messages?user=${member._id}`)}
                                            className="p-2.5 rounded-xl border border-white/20 text-white/50 hover:border-orange-400/50 hover:text-orange-400 hover:bg-orange-500/10 transition-all"
                                        >
                                            <FiMail size={18} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : activeTab === 'invite' && isAdmin ? (
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Invite by Username */}
                            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30">
                                        <FiAtSign className="text-purple-300" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Invite by Username</h3>
                                        <p className="text-sm text-white/60">Add someone directly to your group</p>
                                    </div>
                                </div>

                                <form onSubmit={handleInviteByUsername} className="space-y-4">
                                    <div className="relative">
                                        <FiAtSign className="absolute left-4 top-3.5 text-white/40" size={18} />
                                        <input
                                            type="text"
                                            value={inviteUsername}
                                            onChange={(e) => {
                                                setInviteUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ''));
                                                setInviteError('');
                                            }}
                                            placeholder="username"
                                            className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                                        />
                                    </div>

                                    {inviteError && (
                                        <p className="text-red-400 text-sm">{inviteError}</p>
                                    )}
                                    {inviteSuccess && (
                                        <p className="text-green-400 text-sm">{inviteSuccess}</p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={!inviteUsername.trim() || inviteLoading}
                                        className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 disabled:bg-white/10 disabled:text-white/40 disabled:cursor-not-allowed transition-all"
                                    >
                                        {inviteLoading ? 'Adding...' : 'Add to Group'}
                                    </button>
                                </form>
                            </div>

                            {/* Invite Code */}
                            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
                                        <FiLink className="text-blue-300" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Invite Code</h3>
                                        <p className="text-sm text-white/60">Share a code or link for others to join</p>
                                    </div>
                                </div>

                                {group?.inviteCode?.code && new Date(group.inviteCode.expiresAt) > new Date() ? (
                                    <div className="space-y-4">
                                        {/* Code Display */}
                                        <div className="bg-white/10 rounded-2xl p-4 text-center border border-white/20">
                                            <p className="text-xs text-white/50 mb-2">Your invite code</p>
                                            <p className="text-3xl font-black tracking-[0.3em] text-white">{group.inviteCode.code}</p>
                                            <p className="text-xs text-white/40 mt-2">
                                                Expires {new Date(group.inviteCode.expiresAt).toLocaleDateString()}
                                            </p>
                                        </div>

                                        {/* Copy Buttons */}
                                        <div className="flex gap-3">
                                            <button
                                                onClick={handleCopyCode}
                                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/10 text-white border border-white/20 rounded-xl font-bold hover:bg-white/20 transition-all"
                                            >
                                                {codeCopied ? <FiCheck size={18} /> : <FiCopy size={18} />}
                                                {codeCopied ? 'Copied!' : 'Copy Code'}
                                            </button>
                                            <button
                                                onClick={handleCopyLink}
                                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-xl font-bold hover:bg-blue-500/30 transition-all"
                                            >
                                                <FiLink size={18} />
                                                Copy Link
                                            </button>
                                        </div>

                                        {/* Generate New */}
                                        <button
                                            onClick={handleGenerateInviteCode}
                                            disabled={codeLoading}
                                            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-white/20 text-white/50 rounded-xl font-bold hover:border-white/40 hover:text-white/70 transition-all"
                                        >
                                            <FiRefreshCw size={18} className={codeLoading ? 'animate-spin' : ''} />
                                            Generate New Code
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center py-6">
                                        <p className="text-white/50 mb-4">No active invite code</p>
                                        <button
                                            onClick={handleGenerateInviteCode}
                                            disabled={codeLoading}
                                            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:bg-white/10 disabled:text-white/40 transition-all"
                                        >
                                            {codeLoading ? 'Generating...' : 'Generate Invite Code'}
                                        </button>
                                        <p className="text-xs text-white/40 mt-3">Code expires after 7 days</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>

            {showEditModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowEditModal(false)}>
                    <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-gray-900">Edit Group Details</h2>
                            <button onClick={() => setShowEditModal(false)}><FiX size={24} className="text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleUpdateGroup} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Max Budget (per person)</label>
                                <div className="relative">
                                    <FiDollarSign className="absolute left-3 top-3.5 text-gray-400" />
                                    <input
                                        type="number"
                                        value={editData.budget}
                                        onChange={(e) => setEditData({ ...editData, budget: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Looking For (Number of roommates)</label>
                                <div className="relative">
                                    <FiUsers className="absolute left-3 top-3.5 text-gray-400" />
                                    <input
                                        type="number"
                                        min="1"
                                        value={editData.lookingFor}
                                        onChange={(e) => setEditData({ ...editData, lookingFor: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={editData.description}
                                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                    rows="3"
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all"
                            >
                                Save Changes
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupDashboard;
