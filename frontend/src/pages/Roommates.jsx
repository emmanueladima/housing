import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiFilter, FiSearch, FiUsers, FiPlus, FiUser, FiSliders, FiSettings } from 'react-icons/fi';
import api from '../services/api';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import GroupCard from '../components/Roommates/GroupCard';
import RoommateCard from '../components/Roommates/RoommateCard';
import GroupCreationWizard from '../components/Roommates/GroupCreationWizard';
import GroupDetailsModal from '../components/Roommates/GroupDetailsModal';
import RoommateDetailsModal from '../components/Roommates/RoommateDetailsModal';
import lifestyleProfileService from '../services/lifestyleProfileService';
import roommateGroupService from '../services/roommateGroupService';
import ModernBackground from '../components/shared/ModernBackground';

import { useAuth } from '../contexts/AuthContext';

const Roommates = () => {
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();
    const [activeTab, setActiveTab] = useState('solo'); // 'groups' or 'solo'
    const [groups, setGroups] = useState([]);
    const [soloRoommates, setSoloRoommates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedRoommate, setSelectedRoommate] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showGroupDetailsModal, setShowGroupDetailsModal] = useState(false);
    const [showRoommateDetailsModal, setShowRoommateDetailsModal] = useState(false);
    const [sortBy, setSortBy] = useState('match'); // 'match', 'budget', 'newest'
    const [searchQuery, setSearchQuery] = useState('');
    const [myGroup, setMyGroup] = useState(null);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    useEffect(() => {
        // Fetch user's group on mount
        const fetchMyGroup = async () => {
            try {
                const data = await roommateGroupService.getMyGroup();
                setMyGroup(data);
            } catch (err) {
                // User not in a group
                setMyGroup(null);
            }
        };
        fetchMyGroup();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            if (activeTab === 'groups') {
                const { data } = await api.get('/roommate-groups');
                setGroups(data);
            } else {
                const { data } = await api.get('/lifestyle-profiles/all');
                setSoloRoommates(data.profiles);
            }
        } catch (err) {
            console.error(`Error fetching ${activeTab}:`, err);
            setError(`Failed to load ${activeTab}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGroup = async (formData) => {
        try {
            await api.post('/roommate-groups', {
                name: formData.name,
                description: formData.description,
                budget: {
                    min: parseInt(formData.budget) - 200,
                    max: parseInt(formData.budget),
                },
                location: formData.location,
                vibe: formData.vibe,
                lookingFor: formData.lookingFor + ' more',
            });
            setShowCreateModal(false);
            if (activeTab === 'groups') fetchData();
        } catch (error) {
            console.error('Error creating group:', error);
            alert('Failed to create group');
        }
    };

    const handleViewGroupDetails = (group) => {
        setSelectedGroup(group);
        setShowGroupDetailsModal(true);
    };

    const handleViewRoommateDetails = (roommate) => {
        const formattedRoommate = {
            _id: roommate._id,
            userId: roommate.user?._id,
            firstName: roommate.user?.firstName,
            lastName: roommate.user?.lastName,
            photo: roommate.user?.avatar,
            major: roommate.user?.major || 'Student',
            year: roommate.user?.graduationYear ? `Class of ${roommate.user.graduationYear}` : 'Student',
            budget: { min: roommate.budgetMin, max: roommate.budgetMax },
            tags: roommate.vibeTags,
            compatibility: 85,
            bio: roommate.bio,
            moveIn: roommate.lookingFor?.moveInDate ? new Date(roommate.lookingFor.moveInDate).toLocaleDateString() : 'Flexible',
            habits: {
                cleanliness: roommate.cleanliness >= 4 ? 'Clean' : 'Average',
                sleep: roommate.sleepTime > "23:00" ? 'Night Owl' : 'Early Bird',
                noise: roommate.noiseLevel <= 2 ? 'Quiet' : 'Moderate'
            },
            matchReasons: ['Budget', 'Vibe']
        };

        setSelectedRoommate(formattedRoommate);
        setShowRoommateDetailsModal(true);
    };

    const handleMessageRoommate = (userId) => {
        if (!userId) {
            console.error('No user ID provided for messaging');
            return;
        }
        navigate(`/messages?user=${userId}`);
    };

    const handleRequestJoin = async (group) => {
        try {
            const response = await roommateGroupService.requestJoin(group._id);
            if (response.success) {
                alert(`Request to join "${group.name}" sent successfully! The group admin will review your request.`);
            }
        } catch (error) {
            if (error.response?.data?.message) {
                alert(error.response.data.message);
            } else {
                alert('Failed to send join request. Please try again.');
            }
        }
    };

    const handleFavoriteRoommate = async (profileId) => {
        try {
            const response = await lifestyleProfileService.toggleSavedProfile(profileId);
            if (response.success) {
                await refreshUser();
            }
        } catch (error) {
            console.error('Error toggling saved roommate:', error);
        }
    };

    const getSortedData = (data) => {
        if (!data || !Array.isArray(data)) return [];
        const sorted = [...data];
        switch (sortBy) {
            case 'budget':
                return sorted.sort((a, b) => {
                    const budgetA = a.budget?.max || a.budget || 0;
                    const budgetB = b.budget?.max || b.budget || 0;
                    return budgetA - budgetB;
                });
            case 'newest':
                return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            case 'match':
            default:
                return sorted;
        }
    };

    const getFilteredData = (data) => {
        if (!searchQuery.trim()) return data;
        const query = searchQuery.toLowerCase();
        return data.filter(item => {
            if (activeTab === 'groups') {
                return item.name?.toLowerCase().includes(query) ||
                    item.description?.toLowerCase().includes(query);
            } else {
                return item.user?.firstName?.toLowerCase().includes(query) ||
                    item.user?.lastName?.toLowerCase().includes(query) ||
                    item.bio?.toLowerCase().includes(query);
            }
        });
    };

    const processedData = getSortedData(getFilteredData(activeTab === 'groups' ? groups : soloRoommates));

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Header with Orange Gradient & Orbs */}
            <div className="relative overflow-hidden pt-32 pb-20">
                {/* Orange Gradient Background with Orbs */}
                <ModernBackground />

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Title & Subtitle */}
                    <div className="text-center mb-10">
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                            Find Your Perfect Roommate
                        </h1>
                        <p className="text-white/80 text-lg max-w-2xl mx-auto">
                            Connect with compatible roommates based on lifestyle, budget, and preferences.
                        </p>
                    </div>

                    {/* Pill Tabs */}
                    <div className="flex justify-center mb-8">
                        <div className="inline-flex items-center p-1.5 bg-white/20 backdrop-blur-md rounded-full border border-white/20">
                            <button
                                onClick={() => setActiveTab('solo')}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-full transition-all duration-300 ${activeTab === 'solo'
                                    ? 'bg-white text-orange-600 shadow-lg font-bold'
                                    : 'text-white hover:bg-white/10 font-bold'
                                    }`}
                            >
                                <FiUser size={18} />
                                <span>Solo Roommates</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('groups')}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-full transition-all duration-300 ${activeTab === 'groups'
                                    ? 'bg-white text-orange-600 shadow-lg font-bold'
                                    : 'text-white hover:bg-white/10 font-bold'
                                    }`}
                            >
                                <FiUsers size={18} />
                                <span>Groups</span>
                            </button>
                        </div>
                    </div>

                    {/* Search & Actions Row */}
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-3xl mx-auto">
                        {/* Search Bar */}
                        <div className="relative flex-grow max-w-lg w-full">
                            <div className="relative flex items-center bg-white rounded-2xl shadow-2xl overflow-hidden">
                                <div className="flex items-center pl-5 pr-3">
                                    <FiSearch className="text-gray-400" size={20} />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={`Search ${activeTab === 'groups' ? 'groups' : 'roommates'}...`}
                                    className="flex-1 py-4 px-2 text-gray-900 placeholder-gray-400 focus:outline-none"
                                />
                            </div>
                        </div>


                        {/* Action Buttons */}
                        {activeTab === 'groups' ? (
                            <div className="flex gap-3">
                                {myGroup && (
                                    <button
                                        onClick={() => navigate('/group-dashboard')}
                                        className="flex items-center gap-2 px-6 py-4 bg-white/20 backdrop-blur-md text-white border-2 border-white/30 rounded-2xl font-bold hover:bg-white/30 transition-all"
                                    >
                                        <FiSettings size={18} />
                                        <span>My Group</span>
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="flex items-center gap-2 px-6 py-4 bg-white text-gray-900 rounded-2xl font-bold hover:bg-gray-100 transition-all shadow-2xl hover:-translate-y-0.5"
                                >
                                    <FiPlus size={18} />
                                    <span>Create Group</span>
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => window.location.href = '/profile'}
                                className="flex items-center gap-2 px-6 py-4 bg-white text-gray-900 rounded-2xl font-bold hover:bg-gray-100 transition-all shadow-2xl hover:-translate-y-0.5"
                            >
                                <FiUser size={18} />
                                <span>Create Profile</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    {/* Filter Bar */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                        <p className="text-gray-600 font-medium">
                            {loading ? 'Loading...' : `${processedData.length} ${activeTab === 'groups' ? 'groups' : 'roommates'} found`}
                        </p>

                        {/* Sort Pills */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-500 mr-2">Sort by:</span>
                            {[
                                { id: 'match', label: 'Best Match' },
                                { id: 'budget', label: 'Budget' },
                                { id: 'newest', label: 'Newest' }
                            ].map(option => (
                                <button
                                    key={option.id}
                                    onClick={() => setSortBy(option.id)}
                                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${sortBy === option.id
                                        ? 'bg-orange-600 text-white shadow-md'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Grid */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <LoadingSpinner />
                        </div>
                    ) : error ? (
                        <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-gray-100">
                            <p className="text-red-500 font-medium">{error}</p>
                            <button
                                onClick={fetchData}
                                className="mt-4 px-6 py-2 text-orange-600 font-bold hover:bg-orange-50 rounded-full transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'groups' ? (
                                processedData.length === 0 ? (
                                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                                        <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <FiUsers className="text-orange-500 text-3xl" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">No groups found</h3>
                                        <p className="text-gray-500 mb-8">Be the first to create a group!</p>
                                        <button
                                            onClick={() => setShowCreateModal(true)}
                                            className="px-8 py-3 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 inline-flex items-center gap-2"
                                        >
                                            <FiPlus />
                                            Create Group
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {processedData.map((group) => (
                                            <GroupCard
                                                key={group._id}
                                                group={group}
                                                onViewDetails={handleViewGroupDetails}
                                                onRequestJoin={handleRequestJoin}
                                            />
                                        ))}
                                    </div>
                                )
                            ) : (
                                processedData.length === 0 ? (
                                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                                        <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <FiUser className="text-orange-500 text-3xl" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">No roommates found</h3>
                                        <p className="text-gray-500 mb-8">Check back later or create your own profile!</p>
                                        <button
                                            onClick={() => window.location.href = '/profile'}
                                            className="px-8 py-3 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 inline-flex items-center gap-2"
                                        >
                                            <FiUser />
                                            Create Profile
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {processedData.map((profile) => (
                                            <RoommateCard
                                                key={profile._id}
                                                roommate={{
                                                    firstName: profile.user?.firstName,
                                                    lastName: profile.user?.lastName,
                                                    photo: profile.user?.avatar,
                                                    major: profile.user?.major || 'Student',
                                                    year: profile.user?.graduationYear ? `Class of ${profile.user.graduationYear}` : 'Student',
                                                    budget: { min: profile.budgetMin, max: profile.budgetMax },
                                                    tags: profile.vibeTags,
                                                    compatibility: 85,
                                                    bio: profile.bio,
                                                    moveIn: profile.lookingFor?.moveInDate ? new Date(profile.lookingFor.moveInDate).toLocaleDateString() : 'Flexible',
                                                    habits: {
                                                        cleanliness: profile.cleanliness >= 4 ? 'Clean' : 'Average',
                                                        sleep: profile.sleepTime > "23:00" ? 'Night Owl' : 'Early Bird',
                                                        noise: profile.noiseLevel <= 2 ? 'Quiet' : 'Moderate'
                                                    },
                                                    matchReasons: ['Budget', 'Vibe']
                                                }}
                                                onMessage={() => handleMessageRoommate(profile.user?._id)}
                                                onFavorite={() => handleFavoriteRoommate(profile._id)}
                                                isSaved={user?.savedProfiles?.includes(profile._id)}
                                                onClick={() => handleViewRoommateDetails(profile)}
                                            />
                                        ))}
                                    </div>
                                )
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Modals */}
            <GroupCreationWizard
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreate={handleCreateGroup}
            />
            <GroupDetailsModal
                isOpen={showGroupDetailsModal}
                onClose={() => setShowGroupDetailsModal(false)}
                group={selectedGroup}
                onJoin={() => handleRequestJoin(selectedGroup)}
            />
            <RoommateDetailsModal
                isOpen={showRoommateDetailsModal}
                onClose={() => setShowRoommateDetailsModal(false)}
                roommate={selectedRoommate}
                onMessage={() => selectedRoommate?.userId && handleMessageRoommate(selectedRoommate.userId)}
                onFavorite={() => selectedRoommate && handleFavoriteRoommate(selectedRoommate._id)}
            />
        </div>
    );
};

export default Roommates;
