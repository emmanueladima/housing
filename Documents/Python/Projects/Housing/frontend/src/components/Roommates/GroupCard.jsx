import React from 'react';
import { FiMapPin, FiDollarSign, FiUsers, FiEye } from 'react-icons/fi';

const GroupCard = ({ group, onViewDetails, onRequestJoin }) => {
    const memberCount = group.members?.length || 0;
    const lookingForNumber = parseInt(group.lookingFor) || 1;

    // Mock compatibility score (you can replace this with actual logic)
    const compatibility = 88;

    return (
        <div className="bg-white rounded-2xl border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all overflow-hidden">
            {/* Top Badge */}
            <div className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1.5 inline-block rounded-br-lg">
                Looking for {group.lookingFor || '1 more'}
            </div>

            {/* Content */}
            <div className="p-5">
                {/* Group Name */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">{group.name}</h3>

                {/* Location */}
                <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
                    <FiMapPin size={14} />
                    <span>{group.location || 'Downtown'}</span>
                </div>

                {/* Members Avatars */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex -space-x-2">
                        {[...Array(Math.min(memberCount, 3))].map((_, i) => (
                            <div
                                key={i}
                                className="w-9 h-9 rounded-full bg-orange-200 border-2 border-white flex items-center justify-center text-orange-600 font-bold text-sm"
                            >
                                {group.members?.[i]?.firstName?.charAt(0) || 'M'}
                            </div>
                        ))}
                        {memberCount > 3 && (
                            <div className="w-9 h-9 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-gray-600 font-bold text-xs">
                                +{memberCount - 3}
                            </div>
                        )}
                    </div>
                    <span className=" text-gray-900 font-bold text-sm ml-1">{compatibility}% MATCH</span>
                </div>

                {/* Budget and Vibe Row */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                            <FiDollarSign size={16} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Total Budget</p>
                            <p className="text-sm font-bold text-gray-900">
                                ${group.budget?.min || 800}-${group.budget?.max || 1200}/mo
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                            <FiUsers size={16} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Vibe</p>
                            <p className="text-sm font-bold text-gray-900 truncate">
                                {Array.isArray(group.vibe) ? group.vibe.join(', ') : (group.vibe || 'Studious & Chill')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={() => onViewDetails(group)}
                        className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-sm flex items-center justify-center gap-2"
                    >
                        <FiEye size={16} /> View Details
                    </button>
                    <button
                        onClick={() => onRequestJoin(group)}
                        className="flex-1 px-4 py-2.5 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors text-sm flex items-center justify-center gap-2"
                    >
                        <FiUsers size={16} /> Request Join
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GroupCard;
