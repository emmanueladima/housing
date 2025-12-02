import React, { useState } from 'react';
import { FiBookOpen, FiPlus, FiVolume2, FiUsers, FiTrash2, FiHome } from 'react-icons/fi';

const HouseRules = () => {
    // Mock Data
    const [rules, setRules] = useState([
        { id: 1, category: 'Quiet Hours', text: 'No loud music after 10 PM on weekdays.' },
        { id: 2, category: 'Guests', text: 'Overnight guests limited to 2 nights per week.' },
        { id: 3, category: 'Cleaning', text: 'Dishes must be washed within 24 hours.' },
        { id: 4, category: 'Shared Items', text: 'Ask before borrowing personal items.' },
    ]);

    const categories = [
        { name: 'Quiet Hours', icon: FiVolume2, color: 'blue' },
        { name: 'Guests', icon: FiUsers, color: 'purple' },
        { name: 'Cleaning', icon: FiHome, color: 'green' },
        { name: 'Shared Items', icon: FiBookOpen, color: 'orange' },
    ];

    const deleteRule = (id) => {
        setRules(rules.filter(r => r.id !== id));
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">House Rules</h2>
                    <p className="text-gray-500 text-sm">Set expectations for a happy home.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-sm">
                    <FiPlus /> Add Rule
                </button>
            </div>

            {/* Rules List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.map(cat => {
                    const catRules = rules.filter(r => r.category === cat.name);
                    const Icon = cat.icon;

                    return (
                        <div key={cat.name} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className={`p-4 border-b border-gray-100 flex items-center gap-2 bg-${cat.color}-50`}>
                                <Icon className={`text-${cat.color}-600`} />
                                <h3 className={`font-bold text-${cat.color}-900`}>{cat.name}</h3>
                            </div>
                            <div className="p-4">
                                {catRules.length === 0 ? (
                                    <p className="text-sm text-gray-400 italic">No rules set yet.</p>
                                ) : (
                                    <ul className="space-y-3">
                                        {catRules.map(rule => (
                                            <li key={rule.id} className="flex items-start justify-between group">
                                                <span className="text-gray-700 text-sm">{rule.text}</span>
                                                <button
                                                    onClick={() => deleteRule(rule.id)}
                                                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
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
        </div>
    );
};

export default HouseRules;
