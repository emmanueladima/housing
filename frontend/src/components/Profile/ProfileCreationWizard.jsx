import React, { useState, useEffect } from 'react';
import { FiX, FiUser, FiSun, FiMoon, FiVolume2, FiCheckCircle, FiSmile, FiArrowRight, FiArrowLeft, FiCheck, FiHeart, FiThermometer, FiBook, FiUsers, FiAtSign } from 'react-icons/fi';
import lifestyleProfileService from '../../services/lifestyleProfileService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { NumberInput } from '@heroui/number-input';
import { Select, SelectItem } from '@heroui/select';
import BioTextarea from '../ui/BioTextarea';
import SleepScheduleSlider from '../ui/SleepScheduleSlider';
import MajorAutocomplete from '../ui/MajorAutocomplete';
import UsernameInput from '../ui/UsernameInput';

const ProfileCreationWizard = ({ onClose, onSaved, initialData }) => {
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        age: '',
        gender: '',
        major: '',
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
        lookingForRoommate: false,
        photo: null,
        newPhoto: null,
        photoPreview: null
    });

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                ...initialData,
                sleepSchedule: { ...prev.sleepSchedule, ...initialData.sleepSchedule },
                budget: { ...prev.budget, ...initialData.budget }
            }));
        } else {
            loadProfile();
        }
    }, [initialData]);

    const loadProfile = async () => {
        try {
            const profile = await lifestyleProfileService.getMyProfile();
            if (profile) {
                // Map backend data to frontend state
                const guestsMap = { 'never': 1, 'rarely': 2, 'sometimes': 3, 'often': 4, 'very-often': 5 };

                setFormData(prev => ({
                    ...prev,
                    ...profile,
                    // Map flattened fields back to objects
                    budget: {
                        min: profile.budgetMin || 0,
                        max: profile.budgetMax || 1000
                    },
                    sleepSchedule: {
                        bedtime: profile.sleepTime ? parseInt(profile.sleepTime.split(':')[0]) : 23,
                        wakeup: profile.wakeTime ? parseInt(profile.wakeTime.split(':')[0]) : 8
                    },
                    vibes: profile.vibeTags || [],
                    guestFrequency: guestsMap[profile.guestsFrequency] || 3,
                    smoking: profile.smoking === 'regular' || profile.smoking === 'occasional',
                    // Cleanliness/Noise match (1-10)
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
                    [child]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) : value)
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
        if (step < 4) setStep(step + 1);
        else handleSubmit();
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Transform data for backend
            const payload = {
                ...formData,
                // Flatten budget
                budgetMin: formData.budget?.min || 0,
                budgetMax: formData.budget?.max || 1000,
                // Flatten sleep schedule
                sleepTime: `${String(formData.sleepSchedule?.bedtime || 23).padStart(2, '0')}:00`,
                wakeTime: `${String(formData.sleepSchedule?.wakeup || 8).padStart(2, '0')}:00`,
                // Map fields
                vibeTags: formData.vibes || [],
                guestsFrequency: ['never', 'rarely', 'sometimes', 'often', 'very-often'][Math.min(formData.guestFrequency - 1, 4)] || 'sometimes',
                smoking: formData.smoking ? 'regular' : 'non-smoker',
                lookingForRoommate: formData.lookingForRoommate || false,
                // Keep cleanliness/noiseLevel as is (now 1-10 in backend)
            };

            // Remove incompatible fields
            delete payload.budget;
            delete payload.sleepSchedule;
            delete payload.vibes;
            delete payload.guestFrequency;
            delete payload.photoPreview;
            delete payload.interests; // Not used in backend
            delete payload.newPhoto; // Handled separately
            delete payload.photo; // We use newPhoto for updates

            const savedProfile = await lifestyleProfileService.saveMyProfile(payload, formData.newPhoto);
            onSaved(savedProfile);
            onClose();
        } catch (error) {
            console.error('Error saving profile:', error);
            // Show more detailed error if available
            alert(`Failed to save profile: ${error.response?.data?.error || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const VIBES_OPTIONS = [
        'Chill', 'Social', 'Studious', 'Party', 'Quiet', 'Artsy',
        'Outdoorsy', 'Night Owl', 'Early Bird', 'Fitness', 'Gamer', 'Foodie',
        'Music Lover', 'Movie Buff', 'Pet Lover', 'Traveler', 'Homebody',
        'Clean Freak', 'Minimalist', 'Eco-Friendly', 'Spiritual', 'Adventurous'
    ];

    const steps = [
        { num: 1, label: 'Basics', icon: FiUser, color: 'orange' },
        { num: 2, label: 'Habits', icon: FiMoon, color: 'blue' },
        { num: 3, label: 'Vibe', icon: FiSmile, color: 'purple' },
        { num: 4, label: 'Review', icon: FiCheck, color: 'teal' },
    ];

    const renderStepContent = () => {
        switch (step) {
            case 1: // Basics
                return (
                    <div className="space-y-6">
                        {/* Profile Photo */}
                        <div className="flex flex-col items-center">
                            <label className="block text-sm font-bold text-gray-700 mb-3 text-center">Profile Photo</label>
                            <div className="relative">
                                <img
                                    src={formData.photoPreview || formData.photo || `https://ui-avatars.com/api/?name=User&background=ea580c&color=fff&size=96`}
                                    alt="Profile"
                                    className="w-24 h-24 rounded-2xl object-cover border-4 border-gray-100"
                                />
                                <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                                    <FiUser className="text-white" size={24} />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    newPhoto: file,
                                                    photoPreview: URL.createObjectURL(file)
                                                }));
                                            }
                                        }}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Click to upload photo</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <NumberInput
                                label="Age"
                                labelPlacement="outside"
                                size="lg"
                                value={formData.age}
                                onValueChange={(val) => setFormData(prev => ({ ...prev, age: val }))}
                                min={18}
                                max={99}
                                placeholder="e.g. 21"
                                classNames={{
                                    base: "w-full",
                                    label: "text-sm font-bold text-gray-700 pb-1",
                                    inputWrapper: "h-14 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 focus-within:!bg-white focus-within:!border-orange-500",
                                    input: "text-gray-900"
                                }}
                            />
                            <Select
                                label="Gender"
                                labelPlacement="outside"
                                size="lg"
                                placeholder="Select..."
                                selectedKeys={formData.gender ? [formData.gender] : []}
                                onSelectionChange={(keys) => {
                                    const selected = Array.from(keys)[0];
                                    setFormData(prev => ({ ...prev, gender: selected || '' }));
                                }}
                                classNames={{
                                    base: "w-full",
                                    label: "text-sm font-bold text-gray-700 pb-1",
                                    trigger: "h-14 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 data-[open=true]:border-orange-500",
                                    value: "text-gray-900"
                                }}
                            >
                                <SelectItem key="male">Male</SelectItem>
                                <SelectItem key="female">Female</SelectItem>
                                <SelectItem key="non-binary">Non-binary</SelectItem>
                                <SelectItem key="other">Other</SelectItem>
                            </Select>
                        </div>

                        {/* Major Autocomplete */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Major / Field of Study</label>
                            <MajorAutocomplete
                                value={formData.major || ''}
                                onChange={(value) => setFormData(prev => ({ ...prev, major: value }))}
                                label=""
                                placeholder="e.g. Computer Science"
                            />
                        </div>

                        <BioTextarea
                            value={formData.bio}
                            onChange={(value) => setFormData(prev => ({ ...prev, bio: value }))}
                            label="Bio"
                            placeholder="I'm a junior studying CS. I love hiking and coffee..."
                            maxLength={500}
                        />

                        {/* Username */}
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 border border-orange-200">
                            <div className="flex items-center gap-2 mb-2">
                                <FiAtSign className="text-orange-600" size={18} />
                                <span className="text-sm font-bold text-gray-700">Choose a Username</span>
                            </div>
                            <p className="text-xs text-gray-500 mb-3">This makes it easy for others to find and invite you</p>
                            <UsernameInput
                                currentUsername={user?.username || ''}
                                onUsernameSet={(username) => refreshUser()}
                                className=""
                                showLabel={false}
                                variant="light"
                            />
                        </div>

                        {/* Roommate Visibility Toggle */}
                        <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.lookingForRoommate ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}
                            onClick={() => setFormData(prev => ({ ...prev, lookingForRoommate: !prev.lookingForRoommate }))}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FiUsers className={formData.lookingForRoommate ? 'text-orange-500' : 'text-gray-400'} size={20} />
                                    <div>
                                        <p className="font-bold text-gray-900">Show on Roommates Page</p>
                                        <p className="text-xs text-gray-500">Let others find you as a potential roommate</p>
                                    </div>
                                </div>
                                <div className={`w-12 h-6 rounded-full flex items-center px-1 transition-all ${formData.lookingForRoommate ? 'bg-orange-500 justify-end' : 'bg-gray-200 justify-start'}`}>
                                    <div className="w-4 h-4 bg-white rounded-full shadow" />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 2: // Habits
                return (
                    <div className="space-y-8">
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-bold text-gray-700">Cleanliness</label>
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
                            <div className="flex justify-between text-xs font-medium text-gray-400 mt-1">
                                <span>Relaxed</span>
                                <span>Spotless</span>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-bold text-gray-700">Noise Tolerance</label>
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
                            <div className="flex justify-between text-xs font-medium text-gray-400 mt-1">
                                <span>Library Quiet</span>
                                <span>Concert Hall</span>
                            </div>
                        </div>

                        {/* Sleep Schedule with HeroUI Slider */}
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
                );
            case 3: // Vibe
                return (
                    <div className="space-y-6">
                        <p className="text-gray-500 text-sm">Pick tags that describe you (select multiple)</p>
                        <div className="flex flex-wrap gap-3">
                            {VIBES_OPTIONS.map(vibe => (
                                <button
                                    key={vibe}
                                    type="button"
                                    onClick={() => handleArrayToggle('vibes', vibe)}
                                    className={`px-5 py-3 rounded-full font-bold text-sm transition-all ${formData.vibes?.includes(vibe)
                                        ? 'bg-gray-900 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {vibe}
                                </button>
                            ))}
                        </div>

                        <div className="border-t border-gray-100 pt-6 mt-6">
                            <p className="text-sm font-bold text-gray-700 mb-4">House Rules</p>
                            <div className="space-y-3">
                                <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${formData.smoking ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <span className="font-medium text-gray-900">Smoking Allowed</span>
                                    <input
                                        type="checkbox"
                                        name="smoking"
                                        checked={formData.smoking}
                                        onChange={handleChange}
                                        className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                    />
                                </label>
                                <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${formData.drinking ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <span className="font-medium text-gray-900">Drinking Allowed</span>
                                    <input
                                        type="checkbox"
                                        name="drinking"
                                        checked={formData.drinking}
                                        onChange={handleChange}
                                        className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                    />
                                </label>
                                <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${formData.hasPets ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <span className="font-medium text-gray-900">I Have Pets</span>
                                    <input
                                        type="checkbox"
                                        name="hasPets"
                                        checked={formData.hasPets}
                                        onChange={handleChange}
                                        className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                );
            case 4: // Review
                return (
                    <div className="space-y-6">
                        <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs font-bold text-gray-500 uppercase">Age/Gender</span>
                                    <p className="font-bold text-gray-900">{formData.age} • {formData.gender || 'Not set'}</p>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-gray-500 uppercase">Sleep</span>
                                    <p className="font-bold text-gray-900">{formData.sleepSchedule.bedtime}:00 - {formData.sleepSchedule.wakeup}:00</p>
                                </div>
                            </div>
                            <div>
                                <span className="text-xs font-bold text-gray-500 uppercase">Bio</span>
                                <p className="text-gray-700 italic">"{formData.bio || 'No bio yet'}"</p>
                            </div>
                            <div>
                                <span className="text-xs font-bold text-gray-500 uppercase">Vibe</span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {formData.vibes?.map(v => (
                                        <span key={v} className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600">
                                            {v}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <p className="text-center text-gray-500 text-sm">
                            Your answers help us find compatible roommates for you!
                        </p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-100 shrink-0">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-xl font-black text-gray-900">Edit Profile</h1>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
                            <FiX size={24} />
                        </button>
                    </div>
                    {/* Step Progress */}
                    <div className="flex justify-between items-center">
                        {steps.map((s, i) => (
                            <div key={s.num} className="flex items-center">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${step > s.num
                                    ? 'bg-green-500 text-white'
                                    : step === s.num
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-gray-100 text-gray-400'
                                    }`}>
                                    {step > s.num ? <FiCheck size={14} /> : s.num}
                                </div>
                                {i < steps.length - 1 && (
                                    <div className={`w-6 md:w-10 h-0.5 mx-1 ${step > s.num ? 'bg-green-500' : 'bg-gray-200'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 p-6 overflow-y-auto min-h-0 scroll-smooth" style={{ scrollbarGutter: 'stable' }}>
                    <div className="mb-6">
                        <h2 className="text-2xl font-black text-gray-900 mb-1">{steps[step - 1].label}</h2>
                        <p className="text-gray-500 text-sm">
                            {step === 1 && "Tell us about yourself"}
                            {step === 2 && "Your daily habits"}
                            {step === 3 && "Your vibe and house rules"}
                            {step === 4 && "Review your profile"}
                        </p>
                    </div>
                    {renderStepContent()}
                    {/* Scroll indicator for mobile */}
                    {step === 1 && (
                        <div className="mt-4 text-center text-gray-400 text-xs animate-bounce sm:hidden">
                            ↓ Scroll for more options
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
                    <button
                        onClick={handleBack}
                        disabled={step === 1}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-colors ${step === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        <FiArrowLeft /> Back
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Saving...' : (step === 4 ? 'Save Profile' : 'Next')} <FiArrowRight />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileCreationWizard;
