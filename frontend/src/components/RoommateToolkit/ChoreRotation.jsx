import React, { useState } from 'react';
import { FiCheckCircle, FiCircle, FiPlus, FiClock, FiUser } from 'react-icons/fi';

const ChoreRotation = ({ members = [], chores = [], onAddChore }) => {
    // Use props instead of mock data
    // Note: chores are passed from parent now

    const toggleChore = (id) => {
        // TODO: Implement toggle API
        console.log('Toggle chore', id);
    };

    const completedCount = chores.filter(c => c.completed).length;
    const totalCount = chores.length;
    const progress = totalCount === 0 ? 0 : (completedCount / totalCount) * 100;

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Weekly Chores</h2>
                    <p className="text-gray-500 text-sm">Keep the house clean and happy!</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-sm">
                    <FiPlus /> Add Chore
                </button>
            </div>

            {/* Progress Bar */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-gray-700">Weekly Progress</span>
                    <span className="text-sm font-bold text-orange-600">{completedCount}/{totalCount} Done</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-orange-500 to-pink-500 transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Chores List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {chores.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
                            <FiCheckCircle size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">All Caught Up!</h3>
                        <p className="text-gray-500">No chores scheduled for this week.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {chores.map(chore => (
                            <div key={chore.id} className={`p-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${chore.completed ? 'bg-gray-50/50' : ''}`}>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => toggleChore(chore.id)}
                                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${chore.completed
                                            ? 'bg-green-500 border-green-500 text-white'
                                            : 'border-gray-300 text-transparent hover:border-orange-500'
                                            }`}
                                    >
                                        <FiCheckCircle size={16} />
                                    </button>
                                    <div>
                                        <h3 className={`font-bold text-gray-900 ${chore.completed ? 'line-through text-gray-400' : ''}`}>
                                            {chore.title}
                                        </h3>
                                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                            <span className="flex items-center gap-1">
                                                <FiUser size={12} /> {chore.assignedTo?.firstName || 'Unassigned'}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <FiClock size={12} /> {chore.frequency}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-full ${chore.completed ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                                }`}>
                                                Due {new Date(chore.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChoreRotation;
