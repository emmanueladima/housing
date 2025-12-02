import React, { useState, useEffect } from 'react';
import { FiCheckSquare, FiDollarSign, FiBook, FiClock, FiUsers, FiPlus } from 'react-icons/fi';
import api from '../services/api';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ChoreRotation from '../components/RoommateToolkit/ChoreRotation';
import SplitExpenses from '../components/RoommateToolkit/SplitExpenses';
import HouseRules from '../components/RoommateToolkit/HouseRules';
import SharedTimeline from '../components/RoommateToolkit/SharedTimeline';
import { useNavigate } from 'react-router-dom';

const RoommateToolkit = () => {
    const navigate = useNavigate();
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('chores'); // chores, expenses, rules, timeline

    // Mock Data for UI Demonstration
    const mockGroup = {
        members: [
            { firstName: 'You', id: 'u1' },
            { firstName: 'Sarah', id: 'u2' },
            { firstName: 'Mike', id: 'u3' }
        ],
        choreRotation: [],
        expenses: [],
        houseRules: []
    };

    useEffect(() => {
        // Simulate API call
        setLoading(true);
        setTimeout(() => {
            setGroup(mockGroup);
            setLoading(false);
        }, 500);
    }, []);

    if (loading) return <LoadingSpinner />;

    // Empty State for No Group
    if (!group && !loading && !error) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
                    <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 text-orange-500">
                        <FiUsers size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">No Roommate Group Yet</h2>
                    <p className="text-gray-500 mb-8">
                        Join or create a roommate group to unlock the Toolkit! Manage chores, split expenses, and set house rules together.
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/roommates')}
                            className="w-full py-3 px-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg transform hover:-translate-y-0.5"
                        >
                            Find Roommates
                        </button>
                        <button
                            onClick={() => navigate('/roommates')}
                            className="w-full py-3 px-4 bg-white text-gray-700 border-2 border-gray-200 rounded-xl font-bold hover:border-orange-500 hover:text-orange-600 transition-colors"
                        >
                            Create a Group
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (error) return <div className="text-center py-12 text-red-500">{error}</div>;

    const tabs = [
        { id: 'chores', label: 'Chore Rotation', icon: FiCheckSquare },
        { id: 'expenses', label: 'Split Expenses', icon: FiDollarSign },
        { id: 'rules', label: 'House Rules', icon: FiBook },
        { id: 'timeline', label: 'Shared Timeline', icon: FiClock },
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900 mb-2">Roommate Toolkit</h1>
                    <p className="text-gray-500 text-lg">Manage chores, expenses, and house rules with your roommates.</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[600px]">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 min-w-[150px] py-4 text-center font-bold text-sm transition-all relative ${isActive
                                        ? 'text-orange-600 bg-orange-50/50'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <Icon size={18} className={isActive ? 'text-orange-600' : 'text-gray-400'} />
                                        {tab.label}
                                    </div>
                                    {isActive && (
                                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-600"></div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Content Area */}
                    <div className="p-6 md:p-8 bg-gray-50/30">
                        {activeTab === 'chores' && <ChoreRotation members={group.members} />}
                        {activeTab === 'expenses' && <SplitExpenses members={group.members} />}
                        {activeTab === 'rules' && <HouseRules />}
                        {activeTab === 'timeline' && <SharedTimeline />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoommateToolkit;
