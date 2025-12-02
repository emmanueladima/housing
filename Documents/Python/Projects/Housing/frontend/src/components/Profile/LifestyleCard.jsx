import React from 'react';
import { FiHeart, FiEdit2, FiMoon, FiSun, FiDollarSign } from 'react-icons/fi';

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

    const Slider = ({ label, value, leftLabel, rightLabel, color = "orange" }) => (
        <div className="mb-6">
            <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                <span className="text-sm font-bold text-gray-900">{value}/10</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className={`h-full bg-${color}-500 rounded-full`}
                    style={{ width: `${value * 10}%` }}
                />
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-400">
                <span>{leftLabel}</span>
                <span>{rightLabel}</span>
            </div>
        </div>
    );

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

                {/* Key Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-3 bg-blue-50 rounded-xl">
                        <div className="flex items-center gap-2 text-blue-600 mb-1">
                            <FiMoon size={16} />
                            <span className="text-xs font-bold uppercase">Sleep</span>
                        </div>
                        <p className="font-semibold text-gray-900">{profile.sleepTime} - {profile.wakeTime}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-xl">
                        <div className="flex items-center gap-2 text-green-600 mb-1">
                            <FiDollarSign size={16} />
                            <span className="text-xs font-bold uppercase">Budget</span>
                        </div>
                        <p className="font-semibold text-gray-900">${profile.budgetMin} - ${profile.budgetMax}</p>
                    </div>
                </div>

                {/* Sliders */}
                <div className="space-y-2">
                    <Slider
                        label="Cleanliness"
                        value={profile.cleanliness}
                        leftLabel="Messy"
                        rightLabel="Neat Freak"
                        color="blue"
                    />
                    <Slider
                        label="Noise Tolerance"
                        value={profile.noiseLevel}
                        leftLabel="Silence"
                        rightLabel="Party"
                        color="purple"
                    />
                </div>

                {/* Tags */}
                <div className="mt-8">
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
