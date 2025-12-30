import React, { useState } from 'react';
import { FiBookOpen, FiPlus, FiVolume2, FiUsers, FiTrash2, FiHome, FiX } from 'react-icons/fi';

const HouseRules = ({ rules = [], onAddRule }) => {
    // Use props instead of mock data

    const categories = [
        { name: 'Quiet Hours', icon: FiVolume2, color: 'blue' },
        { name: 'Guests', icon: FiUsers, color: 'purple' },
        { name: 'Cleaning', icon: FiHome, color: 'green' },
        { name: 'Shared Items', icon: FiBookOpen, color: 'orange' },
    ];

    const [showAddModal, setShowAddModal] = useState(false);
    const [newRule, setNewRule] = useState({ text: '', category: 'Quiet Hours' });

    const handleAddRule = (e) => {
        e.preventDefault();
        onAddRule(newRule);
        setShowAddModal(false);
        setNewRule({ text: '', category: 'Quiet Hours' });
    };

    const deleteRule = (id) => {
        // TODO: Implement delete API
        console.log('Delete rule', id);
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-white">House Rules</h2>
                    <p className="text-white/70 text-sm">Set expectations for a happy home.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-sm"
                >
                    <FiPlus /> Add Rule
                </button>
            </div>

            {/* Rules List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.map(cat => {
                    const catRules = rules.filter(r => r.category === cat.name);
                    const Icon = cat.icon;

                    return (
                        <div key={cat.name} className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-sm overflow-hidden">
                            <div className={`p-4 border-b border-white/10 flex items-center gap-2 bg-${cat.color}-500/20`}>
                                <Icon className={`text-${cat.color}-300`} />
                                <h3 className={`font-bold text-${cat.color}-100`}>{cat.name}</h3>
                            </div>
                            <div className="p-4">
                                {catRules.length === 0 ? (
                                    <p className="text-sm text-white/40 italic">No rules set yet.</p>
                                ) : (
                                    <ul className="space-y-3">
                                        {catRules.map(rule => (
                                            <li key={rule?.id || rule?._id} className="flex items-start justify-between group">
                                                <span className="text-white/80 text-sm">{rule.text}</span>
                                                <button
                                                    onClick={() => deleteRule(rule?.id || rule?._id)}
                                                    className="text-white/40 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <FiTrash2 size={14} />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Add Rule Modal */}
            {
                showAddModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
                        <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Add House Rule</h3>
                                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                    <FiX size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleAddRule} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Rule</label>
                                    <input
                                        type="text"
                                        value={newRule.text}
                                        onChange={e => setNewRule({ ...newRule, text: e.target.value })}
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                        placeholder="e.g. No noise after 10 PM"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                                    <select
                                        value={newRule.category}
                                        onChange={e => setNewRule({ ...newRule, category: e.target.value })}
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.name} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
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
                                        Add Rule
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
        </div>
    );
};

export default HouseRules;
