import React, { useState, useEffect } from 'react';
import { FiFilter, FiSearch, FiUsers, FiPlus, FiUser } from 'react-icons/fi';
import api from '../services/api';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import GroupCard from '../components/Roommates/GroupCard';
import RoommateCard from '../components/Roommates/RoommateCard';
import GroupCreationWizard from '../components/Roommates/GroupCreationWizard';
import GroupDetailsModal from '../components/Roommates/GroupDetailsModal';
import RoommateDetailsModal from '../components/Roommates/RoommateDetailsModal';

const Roommates = () => {
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

    useEffect(() => {
        fetchData();
    }, [activeTab]);

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
                    min: parseInt(formData.budget) - 200, // Approximate range
                    max: parseInt(formData.budget),
                },
                location: formData.location,
                vibe: formData.vibe, // Array of strings
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
        // Transform profile data to match modal expectations if needed
        const formattedRoommate = {
            firstName: roommate.user?.firstName,
            lastName: roommate.user?.lastName,
            photo: roommate.user?.avatar,
            major: roommate.user?.major || 'Student',
            year: roommate.user?.graduationYear ? `Class of ${roommate.user.graduationYear}` : 'Student',
            budget: { min: roommate.budgetMin, max: roommate.budgetMax },
            tags: roommate.vibeTags,
            compatibility: 85, // Mock score
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

    const handleRequestJoin = (group) => {
        alert(`Request to join "${group.name}" sent!`);
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
                // Mock match score sorting (since we don't have real match scores yet)
                return sorted;
        }
    };

    const renderSortPills = () => (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500 mr-1">Sort by:</span>
            {[
                { id: 'match', label: 'High Match' },
                { id: 'budget', label: 'Budget' },
                { id: 'newest', label: 'Newest' }
            ].map(option => (
                <button
                    key={option.id}
                    onClick={() => setSortBy(option.id)}
                    className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${sortBy === option.id
                        ? 'bg-black text-white shadow-md'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Left Spacer (to balance the center tabs) */}
                        <div className="hidden md:block w-48"></div>

                        {/* Centered Tabs */}
                        <div className="flex justify-center flex-1">
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setActiveTab('solo')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'solo'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <FiUser /> Solo Roommates
                                </button>
                                <button
                                    onClick={() => setActiveTab('groups')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'groups'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <FiUsers /> Groups
                                </button>
                            </div>
                        </div>

                        {/* Right Action Button */}
                        <div className="flex justify-end w-48">
                            {activeTab === 'groups' ? (
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                                >
                                    <FiPlus /> Create Group
                                </button>
                            ) : (
                                <button
                                    onClick={() => window.location.href = '/profile'}
                                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                                >
                                    <FiUser /> Create Profile
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filters Row */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6">
                        <div className="relative flex-grow max-w-md">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder={`Search ${activeTab === 'groups' ? 'groups' : 'roommates'}...`}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                            />
                        </div>

                        {renderSortPills()}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <LoadingSpinner />
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <p className="text-red-500">{error}</p>
                        <button
                            onClick={fetchData}
                            className="mt-4 text-orange-600 font-medium hover:underline"
                        >
                            Try Again
                        </button>
                    </div>
                ) : (
                    <>
                        {activeTab === 'groups' ? (
                            groups.length === 0 ? (
                                <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FiUsers className="text-gray-400 text-2xl" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900">No groups found</h3>
                                    <p className="text-gray-500 mt-1">Be the first to create a group!</p>
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="mt-6 px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
                                    >
                                        <FiPlus /> Create Group
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {getSortedData(groups).map((group) => (
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
                            soloRoommates.length === 0 ? (
                                <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FiUser className="text-gray-400 text-2xl" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900">No roommates found</h3>
                                    <p className="text-gray-500 mt-1">Check back later!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {getSortedData(soloRoommates).map((profile) => (
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
                                                compatibility: 85, // Mock score
                                                bio: profile.bio,
                                                moveIn: profile.lookingFor?.moveInDate ? new Date(profile.lookingFor.moveInDate).toLocaleDateString() : 'Flexible',
                                                habits: {
                                                    cleanliness: profile.cleanliness >= 4 ? 'Clean' : 'Average',
                                                    sleep: profile.sleepTime > "23:00" ? 'Night Owl' : 'Early Bird',
                                                    noise: profile.noiseLevel <= 2 ? 'Quiet' : 'Moderate'
                                                },
                                                matchReasons: ['Budget', 'Vibe']
                                            }}
                                            onMessage={() => alert('Message sent!')}
                                            onFavorite={() => alert('Saved!')}
                                            onClick={() => handleViewRoommateDetails(profile)}
                                        />
                                    ))}
                                </div>
                            )
                        )}
                    </>
                )}
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
                onMessage={() => alert('Message sent!')}
                onFavorite={() => alert('Saved!')}
            />
        </div>
    );
};

export default Roommates;
