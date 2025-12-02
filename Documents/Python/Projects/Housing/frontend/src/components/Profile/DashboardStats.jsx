import React from 'react';
import { FiEye, FiMessageSquare, FiHeart, FiActivity } from 'react-icons/fi';

const DashboardStats = () => {
    const stats = [
        { label: 'Profile Views', value: '124', icon: FiEye, color: 'blue' },
        { label: 'Matches', value: '18', icon: FiActivity, color: 'green' },
        { label: 'Messages', value: '5', icon: FiMessageSquare, color: 'orange' },
        { label: 'Saved', value: '12', icon: FiHeart, color: 'pink' },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <div key={index} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                            <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                        </div>
                        <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600`}>
                            <Icon size={20} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default DashboardStats;
