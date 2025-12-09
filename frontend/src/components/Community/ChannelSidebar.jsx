import React from 'react';
import { FiHome, FiKey, FiUsers, FiShoppingBag, FiBook, FiMoreHorizontal } from 'react-icons/fi';

const channels = [
    { id: 'all', label: 'All Posts', icon: FiMoreHorizontal, color: 'gray' },
    { id: 'housing', label: 'Housing', icon: FiHome, color: 'orange' },
    { id: 'subleases', label: 'Subleases', icon: FiKey, color: 'teal' },
    { id: 'roommates', label: 'Roommates', icon: FiUsers, color: 'blue' },
    { id: 'furniture', label: 'Furniture', icon: FiShoppingBag, color: 'purple' },
    { id: 'study-groups', label: 'Study Groups', icon: FiBook, color: 'green' },
    { id: 'misc', label: 'Misc', icon: FiMoreHorizontal, color: 'gray' },
];

const colorMap = {
    orange: 'bg-orange-100 text-orange-600 border-orange-200',
    teal: 'bg-teal-100 text-teal-600 border-teal-200',
    blue: 'bg-blue-100 text-blue-600 border-blue-200',
    purple: 'bg-purple-100 text-purple-600 border-purple-200',
    green: 'bg-green-100 text-green-600 border-green-200',
    gray: 'bg-gray-100 text-gray-600 border-gray-200',
};

const activeColorMap = {
    orange: 'bg-orange-500 text-white border-orange-500',
    teal: 'bg-teal-500 text-white border-teal-500',
    blue: 'bg-blue-500 text-white border-blue-500',
    purple: 'bg-purple-500 text-white border-purple-500',
    green: 'bg-green-500 text-white border-green-500',
    gray: 'bg-gray-500 text-white border-gray-500',
};

const ChannelSidebar = ({ activeChannel, onChannelChange }) => {
    return (
        <div className="space-y-1.5">
            {channels.map(channel => {
                const Icon = channel.icon;
                const isActive = activeChannel === channel.id || (activeChannel === '' && channel.id === 'all');

                return (
                    <button
                        key={channel.id}
                        onClick={() => onChannelChange(channel.id === 'all' ? '' : channel.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive
                            ? activeColorMap[channel.color]
                            : `${colorMap[channel.color]} hover:scale-[1.02]`
                            }`}
                    >
                        <Icon size={18} />
                        <span>{channel.label}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default ChannelSidebar;
