import React, { useState, useEffect } from 'react';
import { FiCheckSquare, FiDollarSign, FiBook, FiClock, FiUsers, FiPlus, FiTool, FiInfo, FiClipboard } from 'react-icons/fi';
import roommateGroupService from '../services/roommateGroupService';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ChoreRotation from '../components/RoommateToolkit/ChoreRotation';
import SplitExpenses from '../components/RoommateToolkit/SplitExpenses';
import HouseRules from '../components/RoommateToolkit/HouseRules';
import SharedTimeline from '../components/RoommateToolkit/SharedTimeline';
import MoveInChecklist from '../components/RoommateToolkit/MoveInChecklist';
import ModernBackground from '../components/shared/ModernBackground';
import { useNavigate } from 'react-router-dom';

const RoommateToolkit = () => {
    const navigate = useNavigate();
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('expenses');

    useEffect(() => {
        fetchGroupData();
    }, []);

    const fetchGroupData = async () => {
        setLoading(true);
        try {
            const data = await roommateGroupService.getMyGroup();
            setGroup(data);
        } catch (err) {
            if (err.response && err.response.status === 404) {
                setGroup(null);
            } else {
                console.error('Error fetching group:', err);
                // Don't set error, just continue without group
            }
        } finally {
            setLoading(false);
        }
    };

    // Refresh group data without showing loading spinner (for after adding items)
    const refreshGroupData = async () => {
        try {
            const data = await roommateGroupService.getMyGroup();
            setGroup(data);
        } catch (err) {
            console.error('Error refreshing group:', err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    const tabs = group ? [
        { id: 'checklist', label: 'Move-In', icon: FiClipboard, requiresGroup: false },
        { id: 'chores', label: 'Chores', icon: FiCheckSquare, requiresGroup: true },
        { id: 'expenses', label: 'Expenses', icon: FiDollarSign, requiresGroup: false },
        { id: 'rules', label: 'Rules', icon: FiBook, requiresGroup: true },
        { id: 'timeline', label: 'Timeline', icon: FiClock, requiresGroup: false },
    ] : [
        { id: 'checklist', label: 'Move-In', icon: FiClipboard, requiresGroup: false },
        { id: 'expenses', label: 'My Expenses', icon: FiDollarSign, requiresGroup: false },
        { id: 'timeline', label: 'Timeline', icon: FiClock, requiresGroup: false },
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Header with Orange Gradient & Orbs */}
            <div className="relative overflow-hidden pt-32 pb-16">
                <ModernBackground />

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Title & Subtitle */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 mb-6">
                            <FiTool className="text-yellow-200" size={16} />
                            <span className="text-yellow-100 text-sm font-bold uppercase tracking-wider">Roommate Toolkit</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                            {group?.name || 'Your Personal Toolkit'}
                        </h1>
                        <p className="text-white/80 text-lg max-w-2xl mx-auto mb-6">
                            {group
                                ? 'Manage chores, split expenses, and set house rules with your roommates.'
                                : 'Track your expenses and plan your timeline. Join a group to unlock all features!'
                            }
                        </p>
                        {group ? (
                            <button
                                onClick={() => navigate('/group-dashboard')}
                                className="px-6 py-2.5 bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-full font-bold hover:bg-white/30 transition-all inline-flex items-center gap-2"
                            >
                                <FiUsers size={16} />
                                Manage Group
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate('/roommates')}
                                className="px-6 py-2.5 bg-white text-gray-900 rounded-full font-bold hover:bg-gray-100 transition-all inline-flex items-center gap-2 shadow-lg"
                            >
                                <FiUsers size={16} />
                                Find a Group
                            </button>
                        )}
                    </div>

                    {/* Pill Tabs */}
                    <div className="flex justify-center">
                        <div className="inline-flex items-center p-1.5 bg-white/20 backdrop-blur-md rounded-full border border-white/20">
                            {tabs.map(tab => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 ${isActive
                                            ? 'bg-white text-orange-600 shadow-lg font-bold'
                                            : 'text-white hover:bg-white/10 font-bold'
                                            }`}
                                    >
                                        <Icon size={18} />
                                        <span className="hidden sm:inline">{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-gray-50 min-h-screen">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    {/* Info Banner for Non-Group Users */}
                    {!group && (
                        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-start gap-3">
                            <FiInfo className="text-orange-500 shrink-0 mt-0.5" size={20} />
                            <div>
                                <p className="text-orange-800 font-medium">You're using the personal toolkit</p>
                                <p className="text-orange-600 text-sm">Join or create a roommate group to access shared chores, house rules, and group expense splitting.</p>
                            </div>
                        </div>
                    )}

                    {/* Content Card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px]">
                        <div className="p-6 md:p-8">
                            {activeTab === 'checklist' && <MoveInChecklist />}
                            {activeTab === 'chores' && group && (
                                <ChoreRotation
                                    members={group.members}
                                    chores={group.chores}
                                    onAddChore={(chore) => roommateGroupService.addChore(group._id, chore).then(() => refreshGroupData())}
                                />
                            )}
                            {activeTab === 'expenses' && (
                                <SplitExpenses
                                    members={group?.members || []}
                                    expenses={group?.expenses || []}
                                    onAddExpense={(expense) => {
                                        if (group) {
                                            roommateGroupService.addExpense(group._id, expense).then(() => refreshGroupData());
                                        }
                                    }}
                                    isPersonal={!group}
                                />
                            )}
                            {activeTab === 'rules' && group && (
                                <HouseRules
                                    rules={group.houseRules}
                                    onAddRule={(rule) => roommateGroupService.addRule(group._id, rule).then(() => refreshGroupData())}
                                />
                            )}
                            {activeTab === 'timeline' && <SharedTimeline />}
                        </div>
                    </div>

                    {/* Group Members Card */}
                    {group?.members && group.members.length > 0 && (
                        <div className="mt-6 bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Group Members</h3>
                            <div className="flex flex-wrap gap-3">
                                {group.members.map((member, index) => (
                                    <div
                                        key={member._id || index}
                                        className="flex items-center gap-3 px-4 py-2 bg-orange-50 rounded-full border border-orange-100"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                            {member.user?.firstName?.[0] || member.firstName?.[0] || '?'}
                                        </div>
                                        <span className="font-medium text-gray-700">
                                            {member.user?.firstName || member.firstName || 'Member'} {member.user?.lastName?.[0] || member.lastName?.[0] || ''}.
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoommateToolkit;
