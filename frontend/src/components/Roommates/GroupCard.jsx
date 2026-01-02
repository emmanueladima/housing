import React from 'react';
import { FiMapPin, FiDollarSign, FiUsers, FiEye, FiStar, FiUserPlus } from 'react-icons/fi';
import { Card, CardBody, CardFooter } from '@heroui/card';

const GroupCard = ({ group, onViewDetails, onRequestJoin }) => {
    const memberCount = group.members?.length || 0;
    const compatibility = 88;

    const handleCardClick = () => {
        onViewDetails(group);
    };

    return (
        <Card
            isPressable
            onPress={handleCardClick}
            isBlurred
            className="border-none bg-white/80 dark:bg-default-100/50 shadow-lg hover:shadow-2xl transition-all duration-300 h-full rounded-3xl overflow-hidden"
        >
            {/* Content */}
            <CardBody className="p-5 flex-1 flex flex-col overflow-visible">
                {/* Header: Avatars & Match Score */}
                <div className="flex justify-between items-start mb-4">
                    {/* Member Avatars */}
                    <div className="flex -space-x-2">
                        {[...Array(Math.min(memberCount || 2, 3))].map((_, i) => (
                            <div
                                key={i}
                                className="w-12 h-12 rounded-xl bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden"
                            >
                                {group.members?.[i]?.photo || group.members?.[i]?.avatar ? (
                                    <img src={group.members[i].photo || group.members[i].avatar} alt="Member" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-gray-500 font-bold text-sm">
                                        {group.members?.[i]?.firstName?.charAt(0) || String.fromCharCode(65 + i)}
                                    </span>
                                )}
                            </div>
                        ))}
                        {memberCount > 3 && (
                            <div className="w-12 h-12 rounded-xl bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center text-gray-500 font-bold text-sm">
                                +{memberCount - 3}
                            </div>
                        )}
                    </div>

                    {/* Match Score */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50/80 backdrop-blur-sm rounded-full border border-teal-100/50">
                        <FiStar className="text-teal-600 fill-current" size={14} />
                        <span className="text-teal-700 font-black text-sm">{compatibility}%</span>
                    </div>
                </div>

                {/* Group Name & Location */}
                <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{group.name}</h3>
                        <span className="px-2 py-0.5 bg-orange-100/80 text-orange-700 text-xs font-bold rounded-full">
                            +{group.lookingFor || '1'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500">
                        <FiMapPin size={14} />
                        <span className="font-medium text-sm">{group.location || 'Downtown'}</span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4 mt-auto">
                    <div className="bg-gray-50/50 rounded-xl p-3 border border-white/20 h-full flex flex-col justify-between shadow-sm">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-1 bg-teal-100/50 rounded-md text-teal-600">
                                <FiDollarSign size={12} />
                            </div>
                            <p className="text-xs text-gray-500 font-semibold">Budget</p>
                        </div>
                        <p className="text-lg font-bold text-gray-900">
                            ${typeof group.budget === 'object' ? group.budget.max : (group.budget || 2800)}
                        </p>
                    </div>
                    <div className="bg-gray-50/50 rounded-xl p-3 border border-white/20 h-full flex flex-col justify-between shadow-sm">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-1 bg-blue-100/50 rounded-md text-blue-600">
                                <FiUsers size={12} />
                            </div>
                            <p className="text-xs text-gray-500 font-semibold">Vibe</p>
                        </div>
                        <p className="text-lg font-bold text-gray-900 truncate">
                            {Array.isArray(group.vibe) ? group.vibe[0] : (group.vibe || 'Studious')}
                        </p>
                    </div>
                </div>

                {/* Vibe Tags */}
                {Array.isArray(group.vibe) && group.vibe.length > 1 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {group.vibe.slice(1, 3).map((v, i) => (
                            <span key={i} className="px-2.5 py-1 bg-white/50 border border-white/20 text-gray-600 rounded-lg text-xs font-semibold shadow-sm">
                                {v}
                            </span>
                        ))}
                    </div>
                )}
            </CardBody>

            {/* Action Footer */}
            <CardFooter className="px-5 py-4 border-t border-gray-100/50 flex gap-3 bg-white/40 backdrop-blur-md">
                <button
                    onClick={(e) => { e.stopPropagation(); onViewDetails(group); }}
                    className="flex-1 py-2.5 bg-white/80 text-gray-700 rounded-xl font-semibold hover:bg-white transition-colors text-sm flex items-center justify-center gap-2 shadow-sm"
                >
                    <FiEye size={16} />
                    View Details
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onRequestJoin(group); }}
                    className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black transition-all text-sm flex items-center justify-center gap-2 shadow-lg"
                >
                    <FiUserPlus size={16} />
                    Request Join
                </button>
            </CardFooter>
        </Card>
    );
};

export default GroupCard;
