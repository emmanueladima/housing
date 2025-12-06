import React, { useState } from 'react';
import { FiCheckCircle, FiCircle, FiPlus, FiClock, FiUser, FiX } from 'react-icons/fi';

const ChoreRotation = ({ members = [], chores = [], onAddChore }) => {
    // Use props instead of mock data
    // Note: chores are passed from parent now

    const [showAddModal, setShowAddModal] = useState(false);
    const [newChore, setNewChore] = useState({ title: '', frequency: 'Weekly', assignedTo: '' });

    const handleAddChore = (e) => {
        e.preventDefault();
        onAddChore({
            ...newChore,
            dueDate: new Date() // Simplified due date for now
        });
        setShowAddModal(false);
        setNewChore({ title: '', frequency: 'Weekly', assignedTo: '' });
    };

    const toggleChore = (id) => {
        // TODO: Implement toggle API
        console.log('Toggle chore', id);
    };

    const completedCount = chores ? chores.filter(c => c.completed).length : 0;
    const totalCount = chores ? chores.length : 0;
    const progress = totalCount === 0 ? 0 : (completedCount / totalCount) * 100;

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Weekly Chores</h2>
                    <p className="text-gray-500 text-sm">Keep the house clean and happy!</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-sm"
                >
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
                            <div key={chore.id || chore._id} className={`p-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${chore.completed ? 'bg-gray-50/50' : ''}`}>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => toggleChore(chore._id)}
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

            {/* Add Chore Modal */}
            {
                showAddModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
                        <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Add New Chore</h3>
                                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                    <FiX size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleAddChore} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Chore Title</label>
                                    <input
                                        type="text"
                                        value={newChore.title}
                                        onChange={e => setNewChore({ ...newChore, title: e.target.value })}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                                        placeholder="e.g. Take out trash"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Frequency</label>
                                        <select
                                            value={newChore.frequency}
                                            onChange={e => setNewChore({ ...newChore, frequency: e.target.value })}
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                                        >
                                            <option value="Daily">Daily</option>
                                            <option value="Weekly">Weekly</option>
                                            <option value="Monthly">Monthly</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Assign To</label>
                                        <select
                                            value={newChore.assignedTo}
                                            onChange={e => setNewChore({ ...newChore, assignedTo: e.target.value })}
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                                        >
                                            <option value="">Unassigned</option>
                                            {members.map(m => (
                                                <option key={m._id} value={m._id}>{m.firstName}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
                                    >
                                        Add Chore
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
        </div>
    );
};

export default ChoreRotation;
