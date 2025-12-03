import { FiX, FiUsers, FiDollarSign, FiMapPin, FiCheckCircle, FiMoreHorizontal, FiShield, FiSun, FiMoon, FiVolume2, FiHeart } from 'react-icons/fi';

const GroupDetailsModal = ({ isOpen, onClose, group, onJoin }) => {
    if (!isOpen || !group) return null;

    // Mock data for new features
    const activityStats = {
        lastActive: '2 hours ago',
        listingsReviewed: 12,
        newMembers: 1
    };

    const isDraft = !group.description || group.members?.length < 2;

    // Helper to generate natural language match reasons
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
                {/* Header Image & Info */}
                <div className="relative h-48 bg-orange-500 shrink-0">
                    <div className="absolute top-4 right-4 flex gap-2">
                        <button
                            className="p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-md"
                        >
                            <FiMoreHorizontal size={24} />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-md"
                        >
                            <FiX size={24} />
                        </button>
                    </div>

                    <div className="absolute -bottom-10 left-6 md:left-8 flex items-end w-full pr-12">
                        <div className="flex-1 text-white mb-12">
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-3xl md:text-4xl font-black tracking-tight">{group.name}</h2>
                                {isDraft && (
                                    <span className="px-2 py-1 bg-white/20 text-white text-xs font-bold rounded-md uppercase tracking-wide backdrop-blur-md">
                                        Draft
                                    </span>
                                )}
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold border border-white/30" title="Verified Group">
                                    <FiShield className="text-white" />
                                    <span className="hidden sm:inline">Verified</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-white/90 font-bold text-lg">
                                <FiMapPin /> {group.location}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="pt-8 px-6 md:px-8 pb-8 overflow-y-auto flex-1">
                    {/* Actions & Compatibility */}
                    <div className="flex flex-col-reverse md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full border border-green-100 w-fit">
                            <span className="font-black text-xl">88%</span>
                            <span className="text-sm font-bold uppercase tracking-wide">Match Score</span>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                            <button
                                className="flex-1 md:flex-none py-3 px-4 rounded-xl border-2 border-gray-100 text-gray-500 font-bold hover:border-red-100 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                            >
                                <FiHeart size={20} /> <span className="md:hidden">Save</span>
                            </button>
                            <button
                                onClick={() => { onJoin(); onClose(); }}
                                className="flex-[3] md:flex-none px-8 py-3 rounded-xl bg-black text-white font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
                            >
                                <FiCheckCircle size={20} /> Request to Join
                            </button>
                        </div>
                    </div>

                    {/* Key Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 text-center hover:scale-105 transition-transform">
                            <p className="text-xs text-orange-600 font-bold uppercase mb-1">Budget</p>
                            <p className="text-xl font-black text-gray-900">${group.budget?.max || group.budget}</p>
                            <p className="text-xs text-gray-500">per person</p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-center hover:scale-105 transition-transform">
                            <p className="text-xs text-blue-600 font-bold uppercase mb-1">Looking For</p>
                            <p className="text-xl font-black text-gray-900">{group.lookingFor}</p>
                            <p className="text-xs text-gray-500">more members</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 text-center hover:scale-105 transition-transform">
                            <p className="text-xs text-purple-600 font-bold uppercase mb-1">Active</p>
                            <p className="text-xl font-black text-gray-900">2h</p>
                            <p className="text-xs text-gray-500">ago</p>
                        </div>
                    </div>

                    {/* Group Personality Snapshot */}
                    <section className="mb-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-3">Group Vibe</h3>
                        <div className="flex flex-wrap gap-2">
                            {Array.isArray(group.vibe) ? group.vibe.map((v, i) => (
                                <span key={i} className="px-4 py-2 bg-orange-50 text-orange-700 rounded-xl text-sm font-bold border border-orange-100 shadow-sm">
                                    {v}
                                </span>
                            )) : (
                                <span className="px-4 py-2 bg-orange-50 text-orange-700 rounded-xl text-sm font-bold border border-orange-100 shadow-sm">
                                    {group.vibe || 'Chill'}
                                </span>
                            )}
                        </div>
                    </section>

                    {/* Members */}
                    <section className="mb-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <FiUsers className="text-orange-500" /> Current Members
                        </h3>
                        <div className="space-y-3">
                            {group.members && group.members.map((member, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all bg-white shadow-sm">
                                    <img src={member.photo} alt="Member" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md" />
                                    <div>
                                        <p className="font-bold text-gray-900">Member {i + 1}</p>
                                        <p className="text-xs text-gray-500">Computer Science • Junior</p>
                                    </div>
                                    <div className="ml-auto flex gap-1">
                                        {['Gaming', 'Hiking'].map((interest, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-bold uppercase tracking-wide">
                                                {interest}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {(!group.members || group.members.length === 0) && (
                                <p className="text-gray-500 italic">No members yet. Be the first!</p>
                            )}
                        </div>
                    </section>

                    {/* Group Values & Lifestyle */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <section>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">House Rules & Lifestyle</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-lg text-teal-500 shadow-sm"><FiCheckCircle /></div>
                                        <span className="font-medium text-gray-700">Cleanliness</span>
                                    </div>
                                    <span className="font-bold text-gray-900">High</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-lg text-blue-500 shadow-sm"><FiUsers /></div>
                                        <span className="font-medium text-gray-700">Guests</span>
                                    </div>
                                    <span className="font-bold text-gray-900">Occasional</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-lg text-purple-500 shadow-sm"><FiVolume2 /></div>
                                        <span className="font-medium text-gray-700">Noise</span>
                                    </div>
                                    <span className="font-bold text-gray-900">Quiet</span>
                                </div>
                            </div>
                        </section>

                        <section className="bg-green-50/50 p-5 rounded-2xl border border-green-100 h-fit">
                            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <span className="text-xl">✨</span> Why we match
                            </h3>
                            <ul className="space-y-2">
                                {matchSentences.map((sentence, i) => (
                                    <li key={i} className="flex items-start gap-2 text-gray-700 font-medium text-sm">
                                        <FiCheckCircle className="mt-0.5 text-green-600 shrink-0" />
                                        <span>{sentence}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </div>

                    {/* Description */}
                    <section className="mb-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">About the Group</h3>
                        <p className="text-gray-600 leading-relaxed text-lg">
                            {group.description || "We are a group of focused students who value a quiet study environment but also enjoy movie nights on weekends. We keep the common areas clean and respect each other's privacy."}
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default GroupDetailsModal;
