import React, { useState, useEffect } from 'react';
import { FiX, FiUser, FiSun, FiMoon, FiVolume2, FiCheckCircle, FiSmile, FiArrowRight, FiArrowLeft, FiCheck } from 'react-icons/fi';
import lifestyleProfileService from '../../services/lifestyleProfileService';

const ProfileCreationWizard = ({ onClose, onSaved }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        age: '',
        gender: '',
        bio: '',
        cleanliness: 5,
        noiseLevel: 5,
        sleepSchedule: {
            bedtime: 23,
            wakeup: 7
        },
        budget: {
            min: 0,
            max: 1000
        },
        interests: [],
        vibes: [],
        guestFrequency: 3,
        hasPets: false,
        petAllergies: false,
        smoking: false,
        drinking: false
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const profile = await lifestyleProfileService.getMyProfile();
            if (profile) {
                setFormData(prev => ({
                    ...prev,
                    ...profile,
                    sleepSchedule: { ...prev.sleepSchedule, ...profile.sleepSchedule },
                    budget: { ...prev.budget, ...profile.budget }
                }));
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: type === 'number' ? parseFloat(value) : value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) : value)
            }));
        }
    };

    const handleArrayToggle = (field, value) => {
        setFormData(prev => {
            const array = prev[field] || [];
            const newArray = array.includes(value)
                ? array.filter(item => item !== value)
                : [...array, value];
            return { ...prev, [field]: newArray };
        });
    };

    const handleNext = () => {
        if (step < 5) setStep(step + 1);
        else handleSubmit();
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const savedProfile = await lifestyleProfileService.saveMyProfile(formData);
            onSaved(savedProfile);
            onClose();
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Failed to save profile');
        } finally {
            setLoading(false);
        }
    };

    const VIBES_OPTIONS = ['Chill', 'Social', 'Studious', 'Party', 'Quiet', 'Artsy', 'Outdoorsy', 'Night Owl', 'Early Bird', 'Fitness', 'Gamer', 'Foodie'];

    const renderStepContent = () => {
        switch (step) {
            case 1: // Basics
                return (
                    <div className="text-center w-full max-w-4xl mx-auto">
                        <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 text-orange-500">
                            <FiUser size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">The Basics</h2>
                        <p className="text-gray-500 mb-8">Tell us a bit about yourself.</p>

                        <div className="text-left space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-1">Age</label>
                                    <input
                                        type="number"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleChange}
                                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                        placeholder="e.g. 21"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-1">Gender</label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none bg-white transition-all"
                                    >
                                        <option value="">Select...</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="non-binary">Non-binary</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-1">Bio</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder="I'm a junior studying CS. I love hiking and coffee..."
                                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none resize-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                );
            case 2: // Habits
                return (
                    <div className="text-center w-full max-w-4xl mx-auto">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-500">
                            <FiMoon size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Living Habits</h2>
                        <p className="text-gray-500 mb-8">How do you like to live?</p>

                        <div className="text-left space-y-8">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-bold text-gray-900">Cleanliness</label>
                                    <span className="text-sm font-bold text-orange-600">{formData.cleanliness}/10</span>
                                </div>
                                <input
                                    type="range"
                                    name="cleanliness"
                                    min="1"
                                    max="10"
                                    value={formData.cleanliness}
                                    onChange={handleChange}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                />
                                <div className="flex justify-between text-xs font-bold text-gray-400 mt-1">
                                    <span>Relaxed</span>
                                    <span>Spotless</span>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-bold text-gray-900">Noise Level</label>
                                    <span className="text-sm font-bold text-orange-600">{formData.noiseLevel}/10</span>
                                </div>
                                <input
                                    type="range"
                                    name="noiseLevel"
                                    min="1"
                                    max="10"
                                    value={formData.noiseLevel}
                                    onChange={handleChange}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                />
                                <div className="flex justify-between text-xs font-bold text-gray-400 mt-1">
                                    <span>Quiet Library</span>
                                    <span>Concert Hall</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-1">Bedtime</label>
                                    <select
                                        name="sleepSchedule.bedtime"
                                        value={formData.sleepSchedule.bedtime}
                                        onChange={handleChange}
                                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                                    >
                                        {Array.from({ length: 24 }, (_, i) => (
                                            <option key={i} value={i}>{i}:00</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-1">Wake Up</label>
                                    <select
                                        name="sleepSchedule.wakeup"
                                        value={formData.sleepSchedule.wakeup}
                                        onChange={handleChange}
                                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                                    >
                                        {Array.from({ length: 24 }, (_, i) => (
                                            <option key={i} value={i}>{i}:00</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 3: // Preferences
                return (
                    <div className="text-center w-full max-w-4xl mx-auto">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                            <FiCheckCircle size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">House Rules</h2>
                        <p className="text-gray-500 mb-8">Set some boundaries.</p>

                        <div className="text-left space-y-4">
                            <div className="p-6 border border-gray-200 rounded-xl hover:border-orange-200 transition-colors">
                                <label className="flex items-center justify-between cursor-pointer">
                                    <span className="font-bold text-gray-900">Smoking Allowed?</span>
                                    <input
                                        type="checkbox"
                                        name="smoking"
                                        checked={formData.smoking}
                                        onChange={handleChange}
                                        className="h-6 w-6 text-orange-600 focus:ring-orange-500 border-gray-300 rounded transition-all"
                                    />
                                </label>
                            </div>
                            <div className="p-6 border border-gray-200 rounded-xl hover:border-orange-200 transition-colors">
                                <label className="flex items-center justify-between cursor-pointer">
                                    <span className="font-bold text-gray-900">Drinking Allowed?</span>
                                    <input
                                        type="checkbox"
                                        name="drinking"
                                        checked={formData.drinking}
                                        onChange={handleChange}
                                        className="h-6 w-6 text-orange-600 focus:ring-orange-500 border-gray-300 rounded transition-all"
                                    />
                                </label>
                            </div>
                            <div className="p-6 border border-gray-200 rounded-xl hover:border-orange-200 transition-colors">
                                <label className="flex items-center justify-between cursor-pointer">
                                    <span className="font-bold text-gray-900">Have Pets?</span>
                                    <input
                                        type="checkbox"
                                        name="hasPets"
                                        checked={formData.hasPets}
                                        onChange={handleChange}
                                        className="h-6 w-6 text-orange-600 focus:ring-orange-500 border-gray-300 rounded transition-all"
                                    />
                                </label>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-1">Guest Frequency</label>
                                <select
                                    name="guestFrequency"
                                    value={formData.guestFrequency}
                                    onChange={handleChange}
                                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                                >
                                    <option value={1}>Rarely</option>
                                    <option value={2}>Occasionally</option>
                                    <option value={3}>Often</option>
                                    <option value={4}>Anytime</option>
                                </select>
                            </div>
                        </div>
                    </div>
                );
            case 4: // Vibe
                return (
                    <div className="text-center w-full max-w-4xl mx-auto">
                        <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6 text-purple-500">
                            <FiSmile size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Your Vibe</h2>
                        <p className="text-gray-500 mb-8">Pick tags that describe you.</p>

                        <div className="flex flex-wrap justify-center gap-3">
                            {VIBES_OPTIONS.map(vibe => (
                                <button
                                    key={vibe}
                                    onClick={() => handleArrayToggle('vibes', vibe)}
                                    className={`px-6 py-3 rounded-full font-bold text-sm transition-all transform hover:scale-105 ${formData.vibes?.includes(vibe)
                                        ? 'bg-black text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {vibe}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 5: // Review
                return (
                    <div className="text-center w-full max-w-4xl mx-auto">
                        <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6 text-teal-500">
                            <FiCheck size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Ready to Save?</h2>
                        <p className="text-gray-500 mb-8">Review your profile details.</p>

                        <div className="bg-gray-50 rounded-2xl p-6 text-left space-y-4 border border-gray-100">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs font-bold text-gray-500 uppercase">Age/Gender</span>
                                    <p className="font-bold text-gray-900">{formData.age} • {formData.gender}</p>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-gray-500 uppercase">Sleep</span>
                                    <p className="font-bold text-gray-900">{formData.sleepSchedule.bedtime}:00 - {formData.sleepSchedule.wakeup}:00</p>
                                </div>
                            </div>
                            <div>
                                <span className="text-xs font-bold text-gray-500 uppercase">Bio</span>
                                <p className="text-gray-700 italic">"{formData.bio}"</p>
                            </div>
                            <div>
                                <span className="text-xs font-bold text-gray-500 uppercase">Vibe</span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {formData.vibes?.map(v => (
                                        <span key={v} className="px-2 py-1 bg-white border border-gray-200 rounded-md text-xs font-bold text-gray-600">
                                            {v}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-3xl w-full max-w-5xl min-h-[700px] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-8 border-b border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-black text-gray-900">Edit Profile</h1>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
                            <FiX size={24} />
                        </button>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-2">
                        <div
                            className="bg-orange-500 h-full transition-all duration-500 ease-out"
                            style={{ width: `${(step / 5) * 100}%` }}
                        />
                    </div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Step {step} of 5</p>
                </div>

                {/* Content */}
                <div className="flex-1 p-8 flex flex-col justify-center overflow-y-auto">
                    {renderStepContent()}
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <button
                        onClick={handleBack}
                        disabled={step === 1}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-gray-600 transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : 'hover:bg-gray-200'
                            }`}
                    >
                        <FiArrowLeft /> Back
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Saving...' : (step === 5 ? 'Save Profile' : 'Next')} <FiArrowRight />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileCreationWizard;
