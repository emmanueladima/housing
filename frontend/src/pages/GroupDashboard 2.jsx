import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiCheck, FiX, FiMail, FiClock, FiUserPlus, FiBell, FiArrowLeft, FiSettings, FiDollarSign } from 'react-icons/fi';
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
        <div className="min-h-screen bg-white">
            {/* Hero Header */}
            <div className="relative overflow-hidden pt-32 pb-20">
                <ModernBackground />

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <button
                        onClick={() => navigate('/toolkit')}
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

            {/* Main Content */}
            <div className="bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    {/* Tabs */}
                    <div className="flex gap-4 mb-8">
                        <button
                            onClick={() => setActiveTab('requests')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${activeTab === 'requests'
                                ? 'bg-orange-600 text-white shadow-lg'
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                        >
                            <FiUserPlus size={18} />
                            Join Requests
                            {joinRequests.length > 0 && (
                                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'requests' ? 'bg-white/20' : 'bg-orange-100 text-orange-600'
                                    }`}>
                                    {joinRequests.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('members')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${activeTab === 'members'
                                ? 'bg-orange-600 text-white shadow-lg'
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                        >
                            <FiUsers size={18} />
                            Members
                        </button>
                    </div>

                    {/* Content */}
                    {activeTab === 'requests' ? (
                        <div className="space-y-4">
                            {!isAdmin ? (
                                <div className="bg-white rounded-3xl p-8 border border-gray-200 text-center">
                                    <FiSettings className="text-gray-300 mx-auto mb-4" size={48} />
                                    <p className="text-gray-500 font-medium">Only the group admin can manage join requests.</p>
                                </div>
                            ) : joinRequests.length === 0 ? (
                                <div className="bg-white rounded-3xl p-12 border border-gray-200 text-center">
                                    <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <FiBell className="text-orange-500" size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">No pending requests</h3>
                                    <p className="text-gray-500">
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
                    ) : (
                        <div className="space-y-4">
                            {group.members?.length === 0 ? (
                                <div className="bg-white rounded-3xl p-12 border border-gray-200 text-center">
                                    <FiUsers className="text-gray-300 mx-auto mb-4" size={48} />
                                    <p className="text-gray-500">No members yet.</p>
                                </div>
                            ) : (
                                group.members.map((member, i) => (
                                    <div
                                        key={member._id || i}
                                        className="bg-white rounded-2xl p-5 border border-gray-200 flex items-center gap-4"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                                            {member.avatar ? (
                                                <img src={member.avatar} alt={member.firstName} className="w-full h-full object-cover" />
                                            ) : (
                                                member.firstName?.charAt(0) || '?'
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900">
                                                {member.firstName} {member.lastName}
                                            </h3>
                                            <p className="text-sm text-gray-500">{member.email}</p>
                                        </div>
                                        {(group.admin === member._id || group.admin?._id === member._id) && (
                                            <span className="px-3 py-1 bg-orange-100 text-orange-600 text-xs font-bold rounded-full">
                                                Admin
                                            </span>
                                        )}
                                        <button
                                            onClick={() => navigate(`/messages?user=${member._id}`)}
                                            className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:border-orange-200 hover:text-orange-500 hover:bg-orange-50 transition-all"
                                        >
                                            <FiMail size={18} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
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
