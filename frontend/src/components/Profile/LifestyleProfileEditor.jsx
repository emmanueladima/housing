import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiSave, FiCheck, FiCamera, FiUsers } from 'react-icons/fi';
import lifestyleProfileService from '../../services/lifestyleProfileService';
import { useAuth } from '../../contexts/AuthContext';
import BioTextarea from '../ui/BioTextarea';
import SleepScheduleSlider from '../ui/SleepScheduleSlider';

const LifestyleProfileEditor = ({ onClose, onSaved }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [photoPreview, setPhotoPreview] = useState(null);
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        lookingForRoommate: false,
        photo: '',
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
        drinking: false,
        newPhoto: null
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const profile = await lifestyleProfileService.getMyProfile();
            if (profile) {
                setFormData({
                    ...formData,
                    ...profile,
                    sleepSchedule: { ...formData.sleepSchedule, ...profile.sleepSchedule },
                    budget: { ...formData.budget, ...profile.budget }
                });
                if (profile.photo) {
                    setPhotoPreview(profile.photo);
                }
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

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, newPhoto: file }));
            setPhotoPreview(URL.createObjectURL(file));
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const savedProfile = await lifestyleProfileService.saveMyProfile(formData);
            onSaved(savedProfile);
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Failed to save profile');
        } finally {
            setLoading(false);
        }
    };

    const INTERESTS_OPTIONS = ['Sports', 'Gaming', 'Music', 'Reading', 'Cooking', 'Travel', 'Art', 'Movies', 'Fitness', 'Tech'];
    const VIBES_OPTIONS = [
        // Personality & Social
        'Chill', 'Social', 'Introvert', 'Extrovert', 'Quiet', 'Adventurous', 'Homebody', 'Spontaneous',
        // Schedule & Habits
        'Night Owl', 'Early Bird', 'Studious', 'Workaholic', 'Organized', 'Laid-back',
        // Activities & Hobbies
        'Fitness', 'Outdoorsy', 'Gamer', 'Foodie', 'Creative', 'Music Lover', 'Film Buff', 'Bookworm',
        'Sports Fan', 'Yoga', 'Hiker', 'Coffee Addict', 'Plant Parent', 'Photographer',
        // Lifestyle
        'Vegetarian', 'Vegan', 'Minimalist', 'Eco-Friendly', 'Pet Lover', 'Spiritual', 'Health Conscious',
        // Tech & Career
        'Remote Worker', 'Tech Savvy', 'Entrepreneur', 'STEM',
        // Social & Fun
        'Party', 'Board Games', 'Podcast Fan', 'Anime', 'K-Pop', 'Artsy'
    ];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-gray-900">Edit Lifestyle Profile</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <FiX size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    {/* Profile Photo */}
                    <section className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Profile Photo</h3>
                        <div className="flex items-center gap-6">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="relative cursor-pointer group"
                            >
                                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-gray-200 group-hover:border-orange-400 transition-colors">
                                    {photoPreview || user?.profilePhoto ? (
                                        <img
                                            src={photoPreview || user?.profilePhoto}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <FiCamera className="text-gray-400" size={32} />
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-black/30 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <FiCamera className="text-white" size={24} />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Click to upload a profile photo</p>
                                <p className="text-xs text-gray-400 mt-1">This will be shown on your roommate profile</p>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handlePhotoChange}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>
                    </section>

                    {/* Roommate Sharing Toggle */}
                    <section className="p-4 rounded-xl border-2 border-teal-200 bg-teal-50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-teal-100 rounded-lg text-teal-600">
                                    <FiUsers size={20} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Looking for Roommates?</h3>
                                    <p className="text-sm text-gray-600">Share your profile on the Roommates page</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="lookingForRoommate"
                                    checked={formData.lookingForRoommate}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                            </label>
                        </div>
                        {formData.lookingForRoommate && (
                            <p className="mt-3 text-sm text-teal-700 bg-teal-100 p-2 rounded-lg">
                                ✓ Your profile will appear on the Roommates page for others to find you!
                            </p>
                        )}
                    </section>

                    {/* Basic Info */}
                    <section className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Basic Info</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                                <input
                                    type="number"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
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
                            <BioTextarea
                                value={formData.bio}
                                onChange={(value) => setFormData(prev => ({ ...prev, bio: value }))}
                                label="Bio"
                                placeholder="Tell potential roommates about yourself..."
                                maxLength={500}
                            />
                        </div>
                    </section>

                    {/* Preferences */}
                    <section className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Living Habits</h3>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between mb-1">
                                    <label className="text-sm font-medium text-gray-700">Cleanliness</label>
                                    <span className="text-sm text-gray-500">{formData.cleanliness}/10</span>
                                </div>
                                <input
                                    type="range"
                                    name="cleanliness"
                                    min="1"
                                    max="10"
                                    value={formData.cleanliness}
                                    onChange={handleChange}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                                />
                                <div className="flex justify-between text-xs text-gray-400 mt-1">
                                    <span>Messy</span>
                                    <span>Neat Freak</span>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-1">
                                    <label className="text-sm font-medium text-gray-700">Noise Tolerance</label>
                                    <span className="text-sm text-gray-500">{formData.noiseLevel}/10</span>
                                </div>
                                <input
                                    type="range"
                                    name="noiseLevel"
                                    min="1"
                                    max="10"
                                    value={formData.noiseLevel}
                                    onChange={handleChange}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                                />
                                <div className="flex justify-between text-xs text-gray-400 mt-1">
                                    <span>Quiet</span>
                                    <span>Loud</span>
                                </div>
                            </div>

                            {/* Sleep Schedule */}
                            <div>
                                <SleepScheduleSlider
                                    bedtime={formData.sleepSchedule.bedtime}
                                    wakeup={formData.sleepSchedule.wakeup}
                                    onChange={({ bedtime, wakeup }) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            sleepSchedule: { bedtime, wakeup }
                                        }));
                                    }}
                                />
                            </div>
                        </div>
                    </section>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? 'Saving...' : 'Save Profile'}
                            {!loading && <FiCheck />}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LifestyleProfileEditor;
