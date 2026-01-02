import React, { useState } from 'react';
import { FiX, FiUsers, FiDollarSign, FiMapPin, FiCheckCircle, FiMoreHorizontal, FiShield, FiVolume2, FiHeart, FiUserPlus, FiStar, FiTrash2 } from 'react-icons/fi';
import GlassModal from '../GlassModal';

const GroupDetailsModal = ({ isOpen, onClose, group, onJoin, onDelete, isOwner }) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
        <GlassModal onClose={onClose} className="max-w-4xl">
            {/* Header */}
            <div className="relative shrink-0 pt-8 pb-8 px-8 border-b border-white/10">
                <div className="absolute top-6 right-6 flex gap-3 z-10">
                    <button className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/10 backdrop-blur-sm">
                        <FiMoreHorizontal size={20} />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/10 backdrop-blur-sm"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                <div className="pr-20">
                    <h2 className="text-3xl font-black text-white mb-2">{group.name}</h2>
                    <div className="flex items-center gap-2 text-gray-300 font-medium text-lg">
                        <FiMapPin size={18} />
                        <span>{group.location || 'Downtown Area'}</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Stats & Actions */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Match Score */}
                        <div className="p-6 bg-gradient-to-br from-teal-500/20 to-emerald-500/20 rounded-3xl border border-teal-500/30 backdrop-blur-md relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-teal-500/20 transition-all"></div>
                            <h4 className="text-teal-300 text-sm font-bold uppercase tracking-wider mb-2">Group Match</h4>
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-black text-white">{compatibility}</span>
                                <span className="text-2xl font-bold text-teal-300">%</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3">
                            {!isOwner && (
                                <>
                                    <button
                                        onClick={() => { onJoin(); onClose(); }}
                                        className="w-full py-4 rounded-2xl bg-white text-black font-bold hover:bg-gray-200 transition-all shadow-lg flex items-center justify-center gap-2"
                                    >
                                        <FiUserPlus size={20} />
                                        Request to Join
                                    </button>
                                    <button className="w-full py-4 rounded-2xl border border-white/20 text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2 font-bold bg-white/5">
                                        <FiHeart size={20} />
                                        Save Group
                                    </button>
                                </>
                            )}
                            {isOwner && (
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="w-full py-4 rounded-2xl bg-red-500/20 text-red-300 border border-red-500/30 font-bold hover:bg-red-500/30 transition-all flex items-center justify-center gap-2"
                                >
                                    <FiTrash2 size={20} />
                                    Delete Group
                                </button>
                            )}
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                                <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-xl w-fit mx-auto mb-2"> <FiDollarSign size={18} /> </div>
                                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Budget</p>
                                <p className="text-lg font-bold text-white">${typeof group.budget === 'object' ? group.budget.max : (group.budget || 0)}</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                                <div className="p-2 bg-blue-500/20 text-blue-300 rounded-xl w-fit mx-auto mb-2"> <FiUsers size={18} /> </div>
                                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Looking</p>
                                <p className="text-lg font-bold text-white">{group.lookingFor || '1'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description */}
                        {group.description && (
                            <div>
                                <h3 className="text-lg font-bold text-white mb-3">About the Group</h3>
                                <p className="text-gray-300 leading-relaxed text-lg">{group.description}</p>
                            </div>
                        )}

                        {/* Members */}
                        <div>
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <FiUsers className="text-gray-400" /> Current Members
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {group.members && group.members.length > 0 ? group.members.map((member, i) => (
                                    <div key={member._id || i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center overflow-hidden shrink-0">
                                            {member.profilePhoto ? (
                                                <img src={member.profilePhoto} alt={member.firstName} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-white font-bold text-lg">{member.firstName?.charAt(0) || '?'}</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-lg">{member.firstName} {member.lastName?.charAt(0)}.</p>
                                            <p className="text-sm text-gray-400">{member.school || member.major || 'Student'}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-gray-500 italic">No members yet.</p>
                                )}
                            </div>
                        </div>

                        {/* Vibes */}
                        <div>
                            <h3 className="text-lg font-bold text-white mb-3">Group Vibe</h3>
                            <div className="flex flex-wrap gap-2">
                                {Array.isArray(group.vibe) ? group.vibe.map((v, i) => (
                                    <span key={i} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-200 rounded-xl text-sm font-medium border border-white/10 transition-colors">
                                        {v}
                                    </span>
                                )) : (
                                    <span className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-200 rounded-xl text-sm font-medium border border-white/10 transition-colors">
                                        {group.vibe || 'Chill'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal - Needs to be high z-index too, and styled */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/80 z-[20000] flex items-center justify-center p-4" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="bg-[#1a1a1a] border border-white/20 rounded-3xl p-8 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-2xl flex items-center justify-center mb-4">
                            <FiTrash2 className="text-red-500" size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-white text-center mb-2">Delete Group?</h3>
                        <p className="text-gray-400 text-center mb-8">
                            This action cannot be undone. All group data will be removed.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 py-4 bg-white/10 text-white rounded-2xl font-bold hover:bg-white/20 transition-all border border-white/10"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    onDelete();
                                    setShowDeleteConfirm(false);
                                    onClose();
                                }}
                                className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </GlassModal>
    );
};

export default GroupDetailsModal;
