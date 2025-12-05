import React from 'react';
import { FiHeart, FiEdit2, FiMoon, FiSun, FiDollarSign, FiVolume2, FiCheckCircle, FiCheck } from 'react-icons/fi';

const LifestyleCard = ({ profile, onEdit }) => {
    if (!profile) {
        return (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 text-center h-full flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6 text-orange-500">
                    <FiHeart size={32} />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">No Lifestyle Profile</h3>
                <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                    Create your profile to find roommates who match your vibe.
                </p>
                <button
                    onClick={onEdit}
                    className="px-8 py-3 bg-black text-white rounded-full font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
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
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                    <FiHeart className="text-pink-500" /> Lifestyle & Habits
                </h2>
                <button
                    onClick={onEdit}
                    className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-bold px-4 py-2 bg-orange-50 hover:bg-orange-100 rounded-full transition-colors"
                >
                    <FiEdit2 size={14} /> Edit
                </button>
            </div>

            <div className="p-6 flex-1 flex flex-col gap-8">
                {/* Habits - Colorful Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Sleep */}
                    <div className="flex flex-col p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 transition-transform hover:scale-[1.02]">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white rounded-xl text-indigo-500 shadow-sm">
                                {getSleepLabel(profile.sleepTime) === 'Night Owl' ? <FiMoon /> : <FiSun />}
                            </div>
                            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Sleep</span>
                        </div>
                        <p className="font-black text-indigo-900 text-lg">{getSleepLabel(profile.sleepTime)}</p>
                    </div>

                    {/* Noise */}
                    <div className="flex flex-col p-4 rounded-2xl bg-pink-50/50 border border-pink-100 transition-transform hover:scale-[1.02]">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white rounded-xl text-pink-500 shadow-sm">
                                <FiVolume2 />
                            </div>
                            <span className="text-xs font-bold text-pink-400 uppercase tracking-wider">Noise</span>
                        </div>
                        <p className="font-black text-pink-900 text-lg">{getNoiseLabel(profile.noiseLevel)}</p>
                    </div>

                    {/* Cleanliness */}
                    <div className="flex flex-col p-4 rounded-2xl bg-teal-50/50 border border-teal-100 transition-transform hover:scale-[1.02]">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white rounded-xl text-teal-500 shadow-sm">
                                <FiCheckCircle />
                            </div>
                            <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Cleanliness</span>
                        </div>
                        <p className="font-black text-teal-900 text-lg">{getCleanlinessLabel(profile.cleanliness)}</p>
                    </div>
                </div>

                {/* Key Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                        <div className="flex items-center gap-2 text-blue-600 mb-2">
                            <FiMoon size={16} />
                            <span className="text-xs font-bold uppercase">Hours</span>
                        </div>
                        <p className="font-bold text-gray-900 text-lg">{profile.sleepTime || '-'} - {profile.wakeTime || '-'}</p>
                    </div>
                    <div className="p-4 bg-green-50/50 rounded-2xl border border-green-100">
                        <div className="flex items-center gap-2 text-green-600 mb-2">
                            <FiDollarSign size={16} />
                            <span className="text-xs font-bold uppercase">Budget</span>
                        </div>
                        <p className="font-bold text-gray-900 text-lg">${profile.budgetMin || 0} - ${profile.budgetMax || 0}</p>
                    </div>
                </div>

                {/* My Living Preferences */}
                <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">My Living Preferences</h3>
                    <ul className="space-y-3">
                        {preferences.length > 0 ? preferences.map((pref, i) => (
                            <li key={i} className="flex items-start gap-3 text-gray-700 font-medium">
                                <div className="mt-1">
                                    <FiCheck className="text-green-500" />
                                </div>
                                <span>{pref}</span>
                            </li>
                        )) : (
                            <li className="text-gray-400 italic">No preferences set yet.</li>
                        )}
                    </ul>
                </div>

                {/* Tags */}
                <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Vibe & Interests</h3>
                    <div className="flex flex-wrap gap-2">
                        {profile.vibeTags?.map(tag => (
                            <span key={tag} className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold capitalize">
                                {tag}
                            </span>
                        ))}
                        {profile.interests?.map(tag => (
                            <span key={tag} className="px-4 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-medium capitalize">
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
