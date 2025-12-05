import React from 'react';
import { FiEye, FiMessageSquare, FiHeart, FiActivity } from 'react-icons/fi';

const DashboardStats = ({ stats: inputStats }) => {
    const defaultStats = [
        { label: 'Profile Views', value: '-', icon: FiEye, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Matches', value: '-', icon: FiActivity, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Messages', value: '-', icon: FiMessageSquare, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Saved', value: '-', icon: FiHeart, color: 'text-pink-600', bg: 'bg-pink-50' },
    ];

    const stats = inputStats || defaultStats;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <div key={index} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
                            <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                        </div>
                        <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                            <Icon size={24} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default DashboardStats;
