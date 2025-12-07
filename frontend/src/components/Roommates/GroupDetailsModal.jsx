import React from 'react';
import { FiX, FiUsers, FiDollarSign, FiMapPin, FiCheckCircle, FiMoreHorizontal, FiShield, FiVolume2, FiHeart, FiUserPlus, FiStar } from 'react-icons/fi';

const GroupDetailsModal = ({ isOpen, onClose, group, onJoin }) => {
    if (!isOpen || !group) return null;

    const isDraft = !group.description || group.members?.length < 2;
    const compatibility = 88;

    const getMatchSentences = () => {
        const sentences = [];
        if (group.budget?.max < 1000) sentences.push("This group fits within your budget.");
        if (group.vibe?.includes('Studious')) sentences.push("You share a preference for a quiet study environment.");
        if (group.location === 'Near Campus') sentences.push("The location matches your preference.");
        return sentences.length > 0 ? sentences : ["This group has a compatible lifestyle."];
    };

    const matchSentences = getMatchSentences();

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header - Clean gray background */}
                <div className="relative bg-gray-100 shrink-0 pt-6 pb-16 px-6 md:px-8">
                    {/* Top Actions */}
                    <div className="absolute top-4 right-4 flex gap-2 z-10">
                        <button className="p-2.5 bg-white hover:bg-gray-50 text-gray-500 rounded-xl transition-all shadow-sm border border-gray-200">
                            <FiMoreHorizontal size={18} />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2.5 bg-white hover:bg-gray-50 text-gray-500 rounded-xl transition-all shadow-sm border border-gray-200"
                        >
                            <FiX size={18} />
                        </button>
                    </div>

                    {/* Group Info in Header */}
                    <div className="mt-4">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h2 className="text-2xl font-black text-gray-900">{group.name}</h2>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 font-medium">
                            <FiMapPin size={14} />
                            <span>{group.location || 'Downtown Area'}</span>
                        </div>
                    </div>

                    {/* Member Avatars */}
                    <div className="absolute -bottom-8 left-6 md:left-8 z-20 flex -space-x-3">
                        {[...Array(Math.min((group.members?.length || 2), 4))].map((_, i) => (
                            <div
                                key={i}
                                className="w-14 h-14 rounded-xl bg-gray-200 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden"
                            >
                                {group.members?.[i]?.photo || group.members?.[i]?.avatar ? (
                                    <img src={group.members[i].photo || group.members[i].avatar} alt="Member" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-gray-600 font-bold text-lg">
                                        {group.members?.[i]?.firstName?.charAt(0) || String.fromCharCode(65 + i)}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="pt-12 px-6 md:px-8 pb-8 overflow-y-auto flex-1 bg-white">
                    {/* Actions & Match Score */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        {/* Match Score */}
                        <div className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-full border border-teal-100 w-fit">
                            <FiStar className="fill-current" size={16} />
                            <span className="font-black text-lg">{compatibility}%</span>
                            <span className="text-sm font-bold">Match</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 w-full md:w-auto">
                            <button className="p-3.5 rounded-2xl border-2 border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-all">
                                <FiHeart size={22} />
                            </button>
                            <button
                                onClick={() => { onJoin(); onClose(); }}
                                className="flex-1 md:flex-none px-8 py-3.5 rounded-2xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
                            >
                                <FiUserPlus size={18} />
                                Request to Join
                            </button>
                        </div>
                    </div>

                    {/* Key Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                            <div className="p-2 bg-teal-100 text-teal-600 rounded-xl w-fit mx-auto mb-2">
                                <FiDollarSign size={18} />
                            </div>
                            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Budget</p>
                            <p className="text-xl font-bold text-gray-900">${typeof group.budget === 'object' ? group.budget.max : (group.budget || 0)}</p>
                            <p className="text-xs text-gray-400">per person</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl w-fit mx-auto mb-2">
                                <FiUsers size={18} />
                            </div>
                            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Looking For</p>
                            <p className="text-xl font-bold text-gray-900">{group.lookingFor || '1'}</p>
                            <p className="text-xs text-gray-400">more members</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                            <div className="p-2 bg-purple-100 text-purple-600 rounded-xl w-fit mx-auto mb-2">
                                <FiVolume2 size={18} />
                            </div>
                            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Active</p>
                            <p className="text-xl font-bold text-gray-900">
                                {group.updatedAt ? (
                                    <>
                                        {Math.floor((new Date() - new Date(group.updatedAt)) / (1000 * 60 * 60)) < 24 ? (
                                            `${Math.max(1, Math.floor((new Date() - new Date(group.updatedAt)) / (1000 * 60 * 60)))}h`
                                        ) : (
                                            `${Math.floor((new Date() - new Date(group.updatedAt)) / (1000 * 60 * 60 * 24))}d`
                                        )}
                                    </>
                                ) : 'New'}
                            </p>
                            <p className="text-xs text-gray-400">ago</p>
                        </div>
                    </div>

                    {/* Group Vibe */}
                    <section className="mb-8 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Group Vibe</h3>
                        <div className="flex flex-wrap gap-2">
                            {Array.isArray(group.vibe) ? group.vibe.map((v, i) => (
                                <span key={i} className="px-4 py-2 bg-white rounded-xl text-sm font-medium text-gray-700 border border-gray-200">
                                    {v}
                                </span>
                            )) : (
                                <span className="px-4 py-2 bg-white rounded-xl text-sm font-medium text-gray-700 border border-gray-200">
                                    {group.vibe || 'Chill'}
                                </span>
                            )}
                        </div>
                    </section>

                    {/* Members */}
                    <section className="mb-8 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <FiUsers className="text-gray-500" /> Current Members
                        </h3>
                        <div className="space-y-3">
                            {group.members && group.members.length > 0 ? group.members.map((member, i) => (
                                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white border border-gray-100">
                                    <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden">
                                        {member.photo || member.avatar ? (
                                            <img src={member.photo || member.avatar} alt="Member" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-gray-600 font-bold">{member.firstName?.charAt(0) || '?'}</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{member.firstName} {member.lastName?.charAt(0)}.</p>
                                        <p className="text-xs text-gray-500">{member.major || 'Student'}</p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-gray-500 italic">No members yet. Be the first!</p>
                            )}
                        </div>
                    </section>

                    {/* Why We Match */}
                    <section className="p-5 bg-teal-50/50 rounded-2xl border border-teal-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="text-xl">✨</span> Why we match
                        </h3>
                        <ul className="space-y-3">
                            {matchSentences.map((sentence, i) => (
                                <li key={i} className="flex items-start gap-3 text-gray-700">
                                    <div className="mt-0.5 p-1 bg-teal-500 rounded-full shrink-0">
                                        <FiCheckCircle className="text-white w-3 h-3" />
                                    </div>
                                    <span className="font-medium">{sentence}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* Description */}
                    {group.description && (
                        <section className="mt-6 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-3">About the Group</h3>
                            <p className="text-gray-600 leading-relaxed">{group.description}</p>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GroupDetailsModal;
