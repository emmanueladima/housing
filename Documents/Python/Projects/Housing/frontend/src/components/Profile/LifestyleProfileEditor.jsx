import React, { useState, useEffect } from 'react';
import { FiX, FiSave, FiCheck } from 'react-icons/fi';
import lifestyleProfileService from '../../services/lifestyleProfileService';

const LifestyleProfileEditor = ({ onClose, onSaved }) => {
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
                setFormData({
                    ...formData,
                    ...profile,
                    sleepSchedule: { ...formData.sleepSchedule, ...profile.sleepSchedule },
                    budget: { ...formData.budget, ...profile.budget }
                });
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
    const VIBES_OPTIONS = ['Chill', 'Social', 'Studious', 'Party', 'Quiet', 'Artsy', 'Outdoorsy', 'Night Owl', 'Early Bird'];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-gray-900">Edit Lifestyle Profile</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <FiX size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Tell potential roommates about yourself..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
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
