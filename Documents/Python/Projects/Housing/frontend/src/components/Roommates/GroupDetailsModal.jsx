import { FiX, FiUsers, FiDollarSign, FiMapPin, FiCheckCircle } from 'react-icons/fi';

const GroupDetailsModal = ({ isOpen, onClose, group, onJoin }) => {
    if (!isOpen || !group) return null;

    // Mock data for new features
    const activityStats = {
        lastActive: '2 hours ago',
        listingsReviewed: 12,
        newMembers: 1
    };

    const isDraft = !group.description || group.members?.length < 2;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header Image & Info */}
                <div className="relative h-48 bg-orange-500">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-md"
                    >
                        <FiX size={24} />
                    </button>

                    <div className="absolute -bottom-10 left-8 flex items-end w-full pr-12">
                        <div className="flex-1 text-white mb-12">
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-4xl font-black tracking-tight">{group.name}</h2>
                                {isDraft && (
                                    <span className="px-2 py-1 bg-white/20 text-white text-xs font-bold rounded-md uppercase tracking-wide backdrop-blur-md">
                                        Draft
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-white/90 font-bold text-lg">
                                <FiMapPin /> {group.location}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="pt-8 px-8 pb-8 overflow-y-auto">
                    {/* Key Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-8 -mt-16 relative z-10">
                        <div className="p-4 bg-white rounded-2xl shadow-lg text-center border border-gray-100 hover:scale-105 transition-transform">
                            <p className="text-xs text-orange-600 font-bold uppercase mb-1">Budget</p>
                            <p className="text-xl font-black text-gray-900">${group.budget?.max || group.budget}</p>
                            <p className="text-xs text-gray-500">per person</p>
                        </div>
                        <div className="p-4 bg-white rounded-2xl shadow-lg text-center border border-gray-100 hover:scale-105 transition-transform">
                            <p className="text-xs text-blue-600 font-bold uppercase mb-1">Looking For</p>
                            <p className="text-xl font-black text-gray-900">{group.lookingFor}</p>
                            <p className="text-xs text-gray-500">more members</p>
                        </div>
                        <div className="p-4 bg-white rounded-2xl shadow-lg text-center border border-gray-100 hover:scale-105 transition-transform">
                            <p className="text-xs text-green-600 font-bold uppercase mb-1">Compatibility</p>
                            <p className="text-xl font-black text-gray-900">88%</p>
                            <p className="text-xs text-gray-500">match with you</p>
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
                            {!group.vibe && (
                                <>
                                    <span className="px-4 py-2 bg-purple-50 text-purple-700 rounded-xl text-sm font-bold border border-purple-100 shadow-sm">Night Owls</span>
                                    <span className="px-4 py-2 bg-green-50 text-green-700 rounded-xl text-sm font-bold border border-green-100 shadow-sm">Clean</span>
                                </>
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
                    <section className="mb-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">House Rules & Lifestyle</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-xs text-gray-500 font-bold uppercase mb-1">Cleanliness</p>
                                <p className="font-bold text-gray-900">High</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-xs text-gray-500 font-bold uppercase mb-1">Guests</p>
                                <p className="font-bold text-gray-900">Occasional</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-xs text-gray-500 font-bold uppercase mb-1">Pets</p>
                                <p className="font-bold text-gray-900">No Pets</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-xs text-gray-500 font-bold uppercase mb-1">Smoking</p>
                                <p className="font-bold text-gray-900">No Smoking</p>
                            </div>
                        </div>
                    </section>

                    {/* Description */}
                    <section className="mb-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">About the Group</h3>
                        <p className="text-gray-600 leading-relaxed text-lg">
                            {group.description || "We are a group of focused students who value a quiet study environment but also enjoy movie nights on weekends. We keep the common areas clean and respect each other's privacy."}
                        </p>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors">
                        Close
                    </button>
                    <button
                        onClick={() => { onJoin(); onClose(); }}
                        className="px-8 py-3 rounded-xl bg-black text-white font-bold hover:bg-gray-800 transition-colors shadow-lg flex items-center gap-2"
                    >
                        <FiCheckCircle /> Request to Join
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GroupDetailsModal;
