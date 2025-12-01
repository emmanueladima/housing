import React from 'react';
import { FiMapPin, FiDollarSign, FiUsers, FiEye } from 'react-icons/fi';

const GroupCard = ({ group, onViewDetails, onRequestJoin }) => {
    const memberCount = group.members?.length || 0;

    // Mock compatibility score (you can replace this with actual logic)
    const compatibility = 88;

    return (
        <div className="bg-white rounded-2xl border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all overflow-hidden flex flex-col h-full">
            {/* Top Badge */}
            <div className="flex justify-end">
                <div className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-bl-lg rounded-tr-lg">
                    Looking for {group.lookingFor || '1 more'}
                </div>
            </div>

            {/* Content */}
            <div className="p-5 pt-2 flex flex-col flex-grow">
                {/* Group Name */}
                <h3 className="text-xl font-bold text-gray-900 mb-1">{group.name}</h3>

                {/* Location */}
                <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
                    <FiMapPin size={14} />
                    <span>{group.location || 'Downtown'}</span>
                </div>

                {/* Members Avatars & Match */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex -space-x-2">
                        {[...Array(Math.min(memberCount, 3))].map((_, i) => (
                            <div
                                key={i}
                                className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center overflow-hidden"
                            >
                                {group.members?.[i]?.photo ? (
                                    <img src={group.members[i].photo} alt="Member" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-gray-600 font-bold text-xs">{group.members?.[i]?.firstName?.charAt(0) || 'M'}</span>
                                )}
                            </div>
                        ))}
                        {memberCount > 3 && (
                            <div className="w-10 h-10 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-gray-600 font-bold text-xs">
                                +{memberCount - 3}
                            </div>
                        )}
                        {/* Placeholder for +1 if no members just to match design look */}
                        {memberCount === 0 && (
                            <>
                                <div className="w-10 h-10 rounded-full bg-gray-300 border-2 border-white"></div>
                                <div className="w-10 h-10 rounded-full bg-gray-300 border-2 border-white"></div>
                                <div className="w-10 h-10 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-gray-600 font-bold text-xs">+1</div>
                            </>
                        )}
                    </div>
                    <div className="text-right">
                        <span className="block text-green-500 font-black text-lg leading-none">{compatibility}%</span>
                        <span className="block text-green-500 text-[10px] font-bold uppercase tracking-wider">Match</span>
                    </div>
                </div>

                {/* Budget and Vibe Row */}
                <div className="grid grid-cols-2 gap-3 mb-6 mt-auto">
                    <div className="bg-orange-50 rounded-xl p-3">
                        <p className="text-xs text-orange-600 font-bold mb-1 flex items-center gap-1">
                            <FiDollarSign size={12} /> Total Budget
                        </p>
                        <p className="text-sm font-black text-gray-900">
                            ${group.budget?.max || 2800}/mo
                        </p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3">
                        <p className="text-xs text-blue-600 font-bold mb-1 flex items-center gap-1">
                            <FiUsers size={12} /> Vibe
                        </p>
                        <p className="text-sm font-black text-gray-900 truncate">
                            {Array.isArray(group.vibe) ? group.vibe.join(' & ') : (group.vibe || 'Studious & Chill')}
                        </p>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={() => onViewDetails(group)}
                        className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors text-sm"
                    >
                        View Details
                    </button>
                    <button
                        onClick={() => onRequestJoin(group)}
                        className="flex-1 px-4 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors text-sm flex items-center justify-center gap-2"
                    >
                        <FiUsers size={16} /> Request Join
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GroupCard;
