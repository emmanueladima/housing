import React from 'react';
import { FiX, FiMessageCircle, FiHeart, FiCheckCircle, FiSun, FiMoon, FiVolume2, FiMoreHorizontal, FiShield, FiCalendar, FiDollarSign, FiStar } from 'react-icons/fi';
import GlassModal from '../GlassModal';

const RoommateDetailsModal = ({ isOpen, onClose, roommate, onMessage, onFavorite, isSaved }) => {
    if (!isOpen || !roommate) return null;

    const {
        firstName = 'Alex',
        lastName = 'Johnson',
        photo = 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800',
        major = 'Computer Science',
        year = 'Junior',
        budget = { min: 600, max: 900 },
        tags = ['Early Riser', 'Clean', 'Studious'],
        compatibility = 92,
        bio = "Looking for a chill place near campus. I study a lot but like to hang out on weekends. I'm pretty quiet and respectful of personal space.",
        moveIn = "Sept 1",
        habits = {
            cleanliness: 'High',
            sleep: 'Early Bird',
            noise: 'Quiet'
        },
        matchReasons = ['Cleanliness', 'Sleep Schedule', 'Budget']
    } = roommate;

    const getMatchSentences = () => {
        const sentences = [];
        if (compatibility > 80) sentences.push("You both have very high compatibility scores.");
        if (habits.cleanliness === 'High' || habits.cleanliness === 'Clean') sentences.push("You both prefer a tidy living space.");
        if (habits.sleep === 'Early Bird') sentences.push("Your sleep schedules align perfectly.");
        if (budget.max < 1000) sentences.push("You have similar budget constraints.");
        return sentences.length > 0 ? sentences : ["You have complementary lifestyles."];
    };

    const matchSentences = getMatchSentences();

    // Different colors for habit icons transparency
    const habitColors = {
        sleep: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
        noise: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
        cleanliness: 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
    };

    return (
        <GlassModal onClose={onClose} className="max-w-3xl">
            {/* Header */}
            <div className="relative shrink-0 pt-8 pb-10 px-8 border-b border-white/10">
                {/* Top Actions */}
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

                <div className="flex items-end gap-6">
                    <div className="relative">
                        <img
                            src={photo}
                            alt={`${firstName} ${lastName}`}
                            className="w-32 h-32 rounded-3xl object-cover border-4 border-white/20 shadow-2xl"
                        />

                    </div>

                    <div className="mb-2">
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-3xl font-black text-white">{firstName} {lastName}</h2>
                            <div className="flex items-center gap-1 px-2.5 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-xs font-bold border border-blue-500/30 backdrop-blur-sm">
                                <FiShield size={12} />
                                <span>Verified</span>
                            </div>
                        </div>
                        <p className="text-gray-300 font-medium text-lg">{major} • {year}</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Stats & Match */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Match Score */}
                        <div className="p-6 bg-gradient-to-br from-teal-500/20 to-emerald-500/20 rounded-3xl border border-teal-500/30 backdrop-blur-md relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-teal-500/20 transition-all"></div>
                            <h4 className="text-teal-300 text-sm font-bold uppercase tracking-wider mb-2">Compatibility</h4>
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-black text-white">{compatibility}</span>
                                <span className="text-2xl font-bold text-teal-300">%</span>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <span className="px-2 py-1 bg-teal-500/20 rounded-md text-xs text-teal-200 border border-teal-500/30">Lifestyle</span>
                                <span className="px-2 py-1 bg-teal-500/20 rounded-md text-xs text-teal-200 border border-teal-500/30">Budget</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={onFavorite}
                                className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 ${isSaved
                                    ? 'bg-red-500/20 border-red-500/50 text-red-400'
                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <FiHeart size={24} className={isSaved ? 'fill-current' : ''} />
                                <span className="text-xs font-bold">Save</span>
                            </button>
                            <button
                                onClick={() => { onMessage(); onClose(); }}
                                className="p-4 rounded-2xl bg-white text-black font-bold hover:bg-gray-200 transition-all shadow-lg flex flex-col items-center justify-center gap-2"
                            >
                                <FiMessageCircle size={24} />
                                <span className="text-xs font-bold">Message</span>
                            </button>
                        </div>

                        {/* Quick Stats */}
                        <div className="space-y-3">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400"> <FiDollarSign size={18} /> </div>
                                    <span className="text-gray-400 text-sm font-medium">Budget</span>
                                </div>
                                <span className="text-white font-bold">${budget.min}-${budget.max}</span>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"> <FiCalendar size={18} /> </div>
                                    <span className="text-gray-400 text-sm font-medium">Move-in</span>
                                </div>
                                <span className="text-white font-bold">{moveIn}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Bio */}
                        {bio && (
                            <div>
                                <h3 className="text-lg font-bold text-white mb-3">About {firstName}</h3>
                                <p className="text-gray-300 leading-relaxed text-lg">{bio}</p>
                            </div>
                        )}

                        {/* Vibes */}
                        {tags && tags.length > 0 && (
                            <div>
                                <h3 className="text-lg font-bold text-white mb-3">Vibe</h3>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag, i) => (
                                        <span key={i} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-200 rounded-xl text-sm font-medium border border-white/10 transition-colors">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Habits */}
                        <div>
                            <h3 className="text-lg font-bold text-white mb-4">Lifestyle</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div className={`p-4 rounded-2xl ${habitColors.sleep} backdrop-blur-sm text-center`}>
                                    <div className="w-10 h-10 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-3">
                                        {habits.sleep === 'Night Owl' ? <FiMoon size={18} /> : <FiSun size={18} />}
                                    </div>
                                    <p className="font-bold mb-1">{habits.sleep}</p>
                                    <p className="text-xs opacity-70">Sleep</p>
                                </div>
                                <div className={`p-4 rounded-2xl ${habitColors.noise} backdrop-blur-sm text-center`}>
                                    <div className="w-10 h-10 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-3">
                                        <FiVolume2 size={18} />
                                    </div>
                                    <p className="font-bold mb-1">{habits.noise}</p>
                                    <p className="text-xs opacity-70">Noise</p>
                                </div>
                                <div className={`p-4 rounded-2xl ${habitColors.cleanliness} backdrop-blur-sm text-center`}>
                                    <div className="w-10 h-10 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-3">
                                        <FiCheckCircle size={18} />
                                    </div>
                                    <p className="font-bold mb-1">{habits.cleanliness}</p>
                                    <p className="text-xs opacity-70">Cleanliness</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GlassModal>
    );
};

export default RoommateDetailsModal;
