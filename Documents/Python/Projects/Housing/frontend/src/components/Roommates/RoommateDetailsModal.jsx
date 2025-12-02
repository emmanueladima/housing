import React from 'react';
import { FiX, FiMessageCircle, FiHeart, FiMapPin, FiCheckCircle, FiSun, FiMoon, FiVolume2 } from 'react-icons/fi';

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

                    <div className="absolute -bottom-12 left-8 flex items-end">
                        <div className="relative">
                            <img
                                src={photo}
                                alt={`${firstName} ${lastName}`}
                                className="w-32 h-32 rounded-3xl border-4 border-white shadow-lg object-cover"
                            />
                            <div className="absolute bottom-2 right-2 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
                        </div>
                        <div className="mb-14 ml-4 text-white">
                            <h2 className="text-3xl font-black">{firstName} {lastName}</h2>
                            <p className="text-white/90 font-medium">{major} • {year}</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="pt-16 px-8 pb-8 overflow-y-auto">
                    {/* Compatibility Badge */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full border border-green-100">
                            <span className="font-black text-xl">{compatibility}%</span>
                            <span className="text-sm font-bold uppercase tracking-wide">Match Score</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={onFavorite}
                                className="p-3 rounded-full bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                                <FiHeart size={24} />
                            </button>
                            <button
                                onClick={onMessage}
                                className="px-6 py-3 rounded-xl bg-black text-white font-bold hover:bg-gray-800 transition-colors shadow-lg flex items-center gap-2"
                            >
                                <FiMessageCircle /> Message
                            </button>
                        </div>
                    </div>

                    {/* Bio */}
                    <section className="mb-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-3">About Me</h3>
                        <p className="text-gray-600 leading-relaxed text-lg">"{bio}"</p>
                    </section>

                    {/* Key Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 text-center hover:scale-105 transition-transform">
                            <p className="text-xs text-orange-600 font-bold uppercase mb-1">Budget</p>
                            <p className="text-xl font-black text-gray-900">${budget.min}-${budget.max}</p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-center hover:scale-105 transition-transform">
                            <p className="text-xs text-blue-600 font-bold uppercase mb-1">Move In</p>
                            <p className="text-xl font-black text-gray-900">{moveIn}</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 text-center hover:scale-105 transition-transform">
                            <p className="text-xs text-purple-600 font-bold uppercase mb-1">Looking For</p>
                            <p className="text-xl font-black text-gray-900">Room</p>
                        </div>
                    </div>

                    {/* Habits & Vibe */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <section>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Habits</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-lg text-orange-500 shadow-sm"><FiSun /></div>
                                        <span className="font-medium text-gray-700">Sleep Schedule</span>
                                    </div>
                                    <span className="font-bold text-gray-900">{habits.sleep}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-lg text-blue-500 shadow-sm"><FiVolume2 /></div>
                                        <span className="font-medium text-gray-700">Noise Level</span>
                                    </div>
                                    <span className="font-bold text-gray-900">{habits.noise}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-lg text-green-500 shadow-sm"><span className="text-lg">✨</span></div>
                                        <span className="font-medium text-gray-700">Cleanliness</span>
                                    </div>
                                    <span className="font-bold text-gray-900">{habits.cleanliness}</span>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Vibe & Interests</h3>
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag, i) => (
                                    <span key={i} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 shadow-sm">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Why we match</h3>
                            <div className="space-y-2">
                                {matchReasons.map((reason, i) => (
                                    <div key={i} className="flex items-center gap-2 text-green-700 font-medium">
                                        <FiCheckCircle className="fill-green-100" /> {reason}
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoommateDetailsModal;
