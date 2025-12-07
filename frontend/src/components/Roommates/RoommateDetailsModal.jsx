import React from 'react';
import { FiX, FiMessageCircle, FiHeart, FiCheckCircle, FiSun, FiMoon, FiVolume2, FiMoreHorizontal, FiShield, FiCalendar, FiDollarSign, FiStar } from 'react-icons/fi';

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

    // Different colors for habit icons
    const habitColors = {
        sleep: 'bg-amber-100 text-amber-600',
        noise: 'bg-blue-100 text-blue-600',
        cleanliness: 'bg-teal-100 text-teal-600'
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header - Clean white with gray background */}
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

                    {/* Profile Photo */}
                    <div className="absolute -bottom-12 left-6 md:left-8 z-20">
                        <img
                            src={photo}
                            alt={`${firstName} ${lastName}`}
                            className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg"
                        />
                        {/* Online dot removed */}
                    </div>
                </div>

                {/* Content */}
                <div className="pt-16 px-6 md:px-8 pb-8 overflow-y-auto flex-1">
                    {/* Name & Info */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-2xl font-black text-gray-900">{firstName} {lastName}</h2>
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100">
                                    <FiShield size={10} />
                                    <span>Verified</span>
                                </div>
                            </div>
                            <p className="text-gray-500 font-medium">{major} • {year}</p>
                        </div>

                        {/* Match Score */}
                        <div className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-full border border-teal-100 w-fit">
                            <FiStar className="fill-current" size={16} />
                            <span className="font-black text-lg">{compatibility}%</span>
                            <span className="text-sm font-bold">Match</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mb-8">
                        <button
                            onClick={onFavorite}
                            className={`p-3.5 rounded-2xl border-2 transition-all ${isSaved
                                ? 'border-red-200 bg-red-50 text-red-500'
                                : 'border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-500 hover:bg-red-50'
                                }`}
                        >
                            <FiHeart size={22} className={isSaved ? 'fill-current' : ''} />
                        </button>
                        <button
                            onClick={() => { onMessage(); onClose(); }}
                            className="flex-1 px-8 py-3.5 rounded-2xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
                        >
                            <FiMessageCircle size={18} />
                            Message {firstName}
                        </button>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="flex items-center gap-2 mb-1">
                                <FiDollarSign className="text-emerald-500" size={16} />
                                <p className="text-xs text-gray-500 font-bold uppercase">Budget</p>
                            </div>
                            <p className="text-xl font-bold text-gray-900">${budget.min} - ${budget.max}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="flex items-center gap-2 mb-1">
                                <FiCalendar className="text-blue-500" size={16} />
                                <p className="text-xs text-gray-500 font-bold uppercase">Move-in</p>
                            </div>
                            <p className="text-xl font-bold text-gray-900">{moveIn}</p>
                        </div>
                    </div>

                    {/* Habits - Different Colors */}
                    <section className="mb-8 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Lifestyle</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                                <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-2 ${habitColors.sleep}`}>
                                    {habits.sleep === 'Night Owl' ? <FiMoon size={20} /> : <FiSun size={20} />}
                                </div>
                                <p className="text-sm font-bold text-gray-700">{habits.sleep}</p>
                                <p className="text-xs text-gray-400">Sleep</p>
                            </div>
                            <div className="text-center">
                                <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-2 ${habitColors.noise}`}>
                                    <FiVolume2 size={20} />
                                </div>
                                <p className="text-sm font-bold text-gray-700">{habits.noise}</p>
                                <p className="text-xs text-gray-400">Noise</p>
                            </div>
                            <div className="text-center">
                                <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-2 ${habitColors.cleanliness}`}>
                                    <FiCheckCircle size={20} />
                                </div>
                                <p className="text-sm font-bold text-gray-700">{habits.cleanliness}</p>
                                <p className="text-xs text-gray-400">Cleanliness</p>
                            </div>
                        </div>
                    </section>

                    {/* Why We Match */}
                    <section className="mb-8 p-5 bg-teal-50/50 rounded-2xl border border-teal-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="text-xl">✨</span> Why you match
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

                    {/* Bio */}
                    <section className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-3">About {firstName}</h3>
                        <p className="text-gray-600 leading-relaxed">{bio}</p>
                    </section>

                    {/* Tags */}
                    {tags && tags.length > 0 && (
                        <section className="mt-6">
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoommateDetailsModal;
