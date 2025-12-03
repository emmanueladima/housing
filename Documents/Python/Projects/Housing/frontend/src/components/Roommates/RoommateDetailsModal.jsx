import React from 'react';
import { FiX, FiMessageCircle, FiHeart, FiMapPin, FiCheckCircle, FiSun, FiMoon, FiVolume2, FiMoreHorizontal, FiShield } from 'react-icons/fi';

const RoommateDetailsModal = ({ isOpen, onClose, roommate, onMessage, onFavorite }) => {
    if (!isOpen || !roommate) return null;

    // Mock data if missing
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

    // Helper to generate natural language match reasons
    const getMatchSentences = () => {
        const sentences = [];
        if (compatibility > 80) sentences.push("You both have very high compatibility scores.");
        if (habits.cleanliness === 'High') sentences.push("You both prefer a tidy living space.");
        if (habits.sleep === 'Early Bird') sentences.push("Your sleep schedules align perfectly.");
        if (budget.max < 1000) sentences.push("You have similar budget constraints.");
        return sentences.length > 0 ? sentences : ["You have complementary lifestyles."];
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

                    <div className="absolute -bottom-12 left-6 md:left-8 flex items-end">
                        <div className="relative">
                            <img
                                src={photo}
                                alt={`${firstName} ${lastName}`}
                                className="w-28 h-28 md:w-32 md:h-32 rounded-3xl border-4 border-white shadow-lg object-cover"
                            />
                            <div className="absolute bottom-2 right-2 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
                        </div>
                        <div className="mb-14 ml-4 text-white">
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl md:text-3xl font-black">{firstName} {lastName}</h2>
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold border border-white/30" title="Student Email Verified">
                                    <FiShield className="text-white" />
                                    <span className="hidden sm:inline">Verified Student</span>
                                </div>
                            </div>
                            <p className="text-white/90 font-medium text-sm md:text-base">{major} • {year}</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="pt-16 px-6 md:px-8 pb-8 overflow-y-auto flex-1">
                    {/* Actions & Compatibility */}
                    <div className="flex flex-col-reverse md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full border border-green-100 w-fit">
                            <span className="font-black text-xl">{compatibility}%</span>
                            <span className="text-sm font-bold uppercase tracking-wide">Match Score</span>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                            <button
                                onClick={onFavorite}
                                className="flex-1 md:flex-none py-3 px-4 rounded-xl border-2 border-gray-100 text-gray-500 font-bold hover:border-red-100 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                            >
                                <FiHeart size={20} /> <span className="md:hidden">Save</span>
                            </button>
                            <button
                                onClick={onMessage}
                                className="flex-[3] md:flex-none px-8 py-3 rounded-xl bg-black text-white font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
                            >
                                <FiMessageCircle size={20} /> Message
                            </button>
                        </div>
                    </div>

                    {/* Bio */}
                    <section className="mb-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">About Me</h3>
                        <p className="text-gray-600 leading-relaxed text-lg">"{bio}"</p>
                    </section>

                    {/* Habits - Pill Cards */}
                    <section className="mb-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Lifestyle & Habits</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {/* Sleep */}
                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-900">
                                <div className="p-2 bg-white rounded-xl text-indigo-500 shadow-sm">
                                    {habits.sleep === 'Night Owl' ? <FiMoon /> : <FiSun />}
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase opacity-60">Sleep</p>
                                    <p className="font-bold">{habits.sleep}</p>
                                </div>
                            </div>
                            {/* Noise */}
                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-pink-50 border border-pink-100 text-pink-900">
                                <div className="p-2 bg-white rounded-xl text-pink-500 shadow-sm">
                                    <FiVolume2 />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase opacity-60">Noise</p>
                                    <p className="font-bold">{habits.noise}</p>
                                </div>
                            </div>
                            {/* Cleanliness */}
                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-teal-50 border border-teal-100 text-teal-900">
                                <div className="p-2 bg-white rounded-xl text-teal-500 shadow-sm">
                                    <FiCheckCircle />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase opacity-60">Cleanliness</p>
                                    <p className="font-bold">{habits.cleanliness}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Vibe & Match Reasons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <section>
                            <h3 className="text-lg font-bold text-gray-900 mb-3">Interests</h3>
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold text-gray-700 transition-colors cursor-default">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </section>

                        <section className="bg-green-50/50 p-5 rounded-2xl border border-green-100">
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
                </div>
            </div>
        </div>
    );
};

export default RoommateDetailsModal;
