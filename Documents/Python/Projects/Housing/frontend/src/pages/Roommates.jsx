import React, { useState, useEffect } from 'react';
import { FiFilter, FiSearch, FiUsers, FiPlus } from 'react-icons/fi';
import api from '../services/api';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import GroupCard from '../components/Roommates/GroupCard';
import CreateGroupModal from '../components/Roommates/CreateGroupModal';
import GroupDetailsModal from '../components/Roommates/GroupDetailsModal';

const Roommates = () => {
    const [activeTab, setActiveTab] = useState('groups'); // 'groups' or 'solo'
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/roommate-groups');
            setGroups(data);
        } catch (err) {
            console.error('Error fetching groups:', err);
            setError('Failed to load groups');
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
                vibe: [formData.vibe],
                lookingFor: formData.lookingFor + ' more',
            });
            setShowCreateModal(false);
            fetchGroups(); // Refresh the list
        } catch (error) {
            console.error('Error creating group:', error);
            alert('Failed to create group');
        }
    };

    const handleViewDetails = (group) => {
        setSelectedGroup(group);
        setShowDetailsModal(true);
    };

    const handleRequestJoin = (group) => {
        alert(`Request to join "${group.name}" sent!`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Find Roommates</h1>
                            <p className="text-gray-600 mt-1">Browse groups or find solo roommates</p>
                        </div>

                        {/* Tabs */}
                        <div className="flex items-center gap-2">
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setActiveTab('solo')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'solo'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    Solo Roommates
                                </button>
                                <button
                                    onClick={() => setActiveTab('groups')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'groups'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    Groups
                                </button>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                            >
                                <FiPlus /> Create Group
                            </button>
                        </div>
                    </div>

                    {/* Filters Row */}
                    <div className="flex items-center gap-3 mt-4">
                        <div className="relative flex-grow max-w-md">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search groups by name..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700">
                            <FiFilter /> Filters
                        </button>
                        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black">
                            <option>High Match</option>
                            <option>Budget Fit</option>
                            <option>Move-in Soon</option>
                        </select>
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
                            onClick={fetchGroups}
                            className="mt-4 text-orange-600 font-medium hover:underline"
                        >
                            Try Again
                        </button>
                    </div>
                ) : groups.length === 0 ? (
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
                        {groups.map((group) => (
                            <GroupCard
                                key={group._id}
                                group={group}
                                onViewDetails={handleViewDetails}
                                onRequestJoin={handleRequestJoin}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            <CreateGroupModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreate={handleCreateGroup}
            />
            <GroupDetailsModal
                isOpen={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                group={selectedGroup}
                onJoin={() => handleRequestJoin(selectedGroup)}
            />
        </div>
    );
};

export default Roommates;
