import React from 'react';
import { FiHeart, FiEdit2, FiMoon, FiSun, FiDollarSign, FiVolume2, FiCheckCircle, FiCheck } from 'react-icons/fi';

const LifestyleCard = ({ profile, onEdit }) => {
    if (!profile) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-500">
                    <FiHeart size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Lifestyle Profile Yet</h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                    Create your lifestyle profile to help us find roommates who match your vibe and habits.
                </p>
                <button
                    onClick={onEdit}
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition-colors"
                >
                    Create Profile
                </button>
            </div>
        );
    }

    // Helper to map numeric values to labels
    const getCleanlinessLabel = (val) => {
        if (val <= 3) return 'Relaxed';
        if (val <= 7) return 'Moderate';
        return 'Neat Freak';
    };

    const getNoiseLabel = (val) => {
        if (val <= 3) return 'Quiet';
        if (val <= 7) return 'Moderate';
        return 'Social';
    };

    const getSleepLabel = (time) => {
        if (!time) return 'Unknown';
        const hour = parseInt(time.split(':')[0]);
        if (hour >= 22 || hour <= 4) return 'Night Owl';
        return 'Early Bird';
    };

    // Generate natural language preferences
    const getPreferences = () => {
        const prefs = [];
        if (profile.cleanliness >= 8) prefs.push("I prefer a very clean and tidy living space.");
        if (profile.noiseLevel <= 3) prefs.push("I value a quiet environment for studying.");
        if (profile.noiseLevel >= 8) prefs.push("I enjoy a social and lively atmosphere.");
        if (getSleepLabel(profile.sleepTime) === 'Early Bird') prefs.push("I'm an early riser.");
        else prefs.push("I tend to stay up late.");
        return prefs;
    };

    const preferences = getPreferences();

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <FiHeart className="text-pink-500" /> Lifestyle & Habits
                </h2>
                <button
                    onClick={onEdit}
                    className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-medium px-3 py-1.5 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                >
                    <FiEdit2 size={14} /> Edit
                </button>
            </div>

            <div className="p-6">
                {/* Bio */}
                {profile.bio && (
                    <div className="mb-8">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">About Me</h3>
                        <p className="text-gray-700 italic leading-relaxed">"{profile.bio}"</p>
                    </div>
                )}

                {/* Habits - Pill Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                    {/* Sleep */}
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-900">
                        <div className="p-2 bg-white rounded-xl text-indigo-500 shadow-sm">
                            {getSleepLabel(profile.sleepTime) === 'Night Owl' ? <FiMoon /> : <FiSun />}
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase opacity-60">Sleep</p>
                            <p className="font-bold">{getSleepLabel(profile.sleepTime)}</p>
                        </div>
                    </div>
                    {/* Noise */}
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-pink-50 border border-pink-100 text-pink-900">
                        <div className="p-2 bg-white rounded-xl text-pink-500 shadow-sm">
                            <FiVolume2 />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase opacity-60">Noise</p>
                            <p className="font-bold">{getNoiseLabel(profile.noiseLevel)}</p>
                        </div>
                    </div>
                    {/* Cleanliness */}
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-teal-50 border border-teal-100 text-teal-900">
                        <div className="p-2 bg-white rounded-xl text-teal-500 shadow-sm">
                            <FiCheckCircle />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase opacity-60">Cleanliness</p>
                            <p className="font-bold">{getCleanlinessLabel(profile.cleanliness)}</p>
                        </div>
                    </div>
                </div>

                {/* Key Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-2 text-blue-600 mb-1">
                            <FiMoon size={16} />
                            <span className="text-xs font-bold uppercase">Hours</span>
                        </div>
                        <p className="font-semibold text-gray-900">{profile.sleepTime} - {profile.wakeTime}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                        <div className="flex items-center gap-2 text-green-600 mb-1">
                            <FiDollarSign size={16} />
                            <span className="text-xs font-bold uppercase">Budget</span>
                        </div>
                        <p className="font-semibold text-gray-900">${profile.budgetMin} - ${profile.budgetMax}</p>
                    </div>
                </div>

                {/* My Living Preferences */}
                <div className="mb-8">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">My Living Preferences</h3>
                    <ul className="space-y-2">
                        {preferences.map((pref, i) => (
                            <li key={i} className="flex items-start gap-2 text-gray-700 font-medium text-sm">
                                <FiCheck className="mt-0.5 text-green-500 shrink-0" />
                                <span>{pref}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Tags */}
                <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Vibe & Interests</h3>
                    <div className="flex flex-wrap gap-2">
                        {profile.vibeTags?.map(tag => (
                            <span key={tag} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium capitalize">
                                {tag}
                            </span>
                        ))}
                        {profile.interests?.map(tag => (
                            <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm capitalize">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LifestyleCard;
