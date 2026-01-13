import React, { useState, useRef } from 'react';
import { FiX, FiUsers, FiDollarSign, FiSmile, FiArrowRight, FiArrowLeft, FiCheck, FiImage } from 'react-icons/fi';
import GlassModal from '../GlassModal';

const GroupCreationWizard = ({ isOpen, onClose, onCreate }) => {
    const [step, setStep] = useState(1);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        budget: '',
        lookingFor: 1,
        vibe: [],
        image: null
    });
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const validateStep = () => {
        const newErrors = {};
        if (step === 1) {
            if (!formData.name.trim()) newErrors.name = 'Group name is required';
        }
        if (step === 2) {
            if (!formData.budget) newErrors.budget = 'Budget is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (!validateStep()) return;
        if (step < 4) setStep(step + 1);
        else {
            onCreate(formData);
            onClose();
        }
    };

    const handleBack = () => {
        setErrors({});
        if (step > 1) setStep(step - 1);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) setErrors({ ...errors, [name]: null });
    };

    const toggleVibe = (vibe) => {
        setFormData(prev => {
            const vibes = prev.vibe.includes(vibe)
                ? prev.vibe.filter(v => v !== vibe)
                : [...prev.vibe, vibe];
            return { ...prev, vibe: vibes };
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="text-center max-w-lg mx-auto">
                        <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-orange-400 border border-orange-500/30">
                            <FiUsers size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2">Let's start with the basics</h2>
                        <p className="text-gray-400 mb-8">Give your group a catchy name and description.</p>

                        <div className="text-left space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-2">
                                    Group Name <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g., The Study Hub, Weekend Warriors"
                                    className={`w-full p-4 bg-white/5 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-white placeholder-white/40 ${errors.name ? 'border-red-400/50' : 'border-white/10'}`}
                                />
                                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-2">Short Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder="Tell potential roommates what your group is about..."
                                    className="w-full p-4 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none text-white placeholder-white/40"
                                />
                            </div>

                            {/* Group Image Upload */}
                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-2">Group Photo</label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center cursor-pointer hover:border-orange-400/50 hover:bg-white/5 transition-colors"
                                >
                                    {imagePreview ? (
                                        <div className="relative w-32 h-32 mx-auto group">
                                            <img src={imagePreview} alt="Group preview" className="w-full h-full object-cover rounded-xl" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center text-white text-xs">Change</div>
                                        </div>
                                    ) : (
                                        <>
                                            <FiImage className="mx-auto text-gray-500 mb-3" size={32} />
                                            <p className="text-sm text-gray-400">Click to upload an image</p>
                                        </>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="text-center max-w-lg mx-auto">
                        <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-400 border border-blue-500/30">
                            <FiDollarSign size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2">Budget & Size</h2>
                        <p className="text-gray-400 mb-8">Set your budget and how many roommates you're looking for.</p>

                        <div className="text-left space-y-5">
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2">
                                        Max Budget ($) <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="budget"
                                        value={formData.budget}
                                        onChange={handleChange}
                                        placeholder="1200"
                                        className={`w-full p-4 bg-white/5 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-white placeholder-white/40 ${errors.budget ? 'border-red-400/50' : 'border-white/10'}`}
                                    />
                                    {errors.budget && <p className="text-red-400 text-xs mt-1">{errors.budget}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2">
                                        Looking For <span className="text-red-400">*</span>
                                    </label>
                                    <select
                                        name="lookingFor"
                                        value={formData.lookingFor}
                                        onChange={handleChange}
                                        className="w-full p-4 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-white appearance-none cursor-pointer"
                                        style={{ backgroundImage: 'none' }} // Remove default arrow if needed, or customize
                                    >
                                        {[1, 2, 3, 4].map(n => <option key={n} value={n} className="text-black">{n} Roommate{n > 1 ? 's' : ''}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 3:
                const vibes = [
                    'Studious', 'Chill', 'Party', 'Clean', 'Gamers', 'Night Owls', 'Early Birds', 'Fitness', 'Music',
                    'Pet Lovers', 'Eco-Friendly', 'Foodies', 'Movie Nights', 'Quiet', 'Social', 'Outdoorsy', 'Creative'
                ];
                return (
                    <div className="text-center max-w-2xl mx-auto">
                        <div className="w-20 h-20 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-teal-400 border border-teal-500/30">
                            <FiSmile size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2">What's the vibe?</h2>
                        <p className="text-gray-400 mb-8">Select tags that best describe your group.</p>

                        <div className="flex flex-wrap justify-center gap-3">
                            {vibes.map(v => (
                                <button
                                    key={v}
                                    onClick={() => toggleVibe(v)}
                                    className={`px-6 py-3 rounded-full font-bold text-sm transition-all border ${formData.vibe.includes(v)
                                        ? 'bg-orange-500 text-white border-orange-500 shadow-lg scale-105'
                                        : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    {v}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="text-center max-w-lg mx-auto">
                        <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-purple-400 border border-purple-500/30">
                            <FiCheck size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2">Ready to launch?</h2>
                        <p className="text-gray-400 mb-8">Review your group details before creating.</p>

                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-left space-y-6 backdrop-blur-sm">
                            {imagePreview && (
                                <div className="text-center mb-6">
                                    <img src={imagePreview} alt="Group" className="w-24 h-24 object-cover rounded-2xl mx-auto border-4 border-white/10 shadow-lg" />
                                </div>
                            )}
                            <div>
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Name</span>
                                <p className="font-bold text-white text-xl mt-1">{formData.name}</p>
                            </div>
                            {formData.description && (
                                <div>
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Description</span>
                                    <p className="text-gray-300 mt-1 leading-relaxed">{formData.description}</p>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div>
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Budget</span>
                                    <p className="font-bold text-white text-lg mt-1">${formData.budget}/mo</p>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Looking For</span>
                                    <p className="font-bold text-white text-lg mt-1">{formData.lookingFor} rm{formData.lookingFor > 1 ? 's' : ''}</p>
                                </div>
                            </div>
                            {formData.vibe.length > 0 && (
                                <div>
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Vibe</span>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {formData.vibe.map(v => (
                                            <span key={v} className="px-3 py-1 bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-gray-300">
                                                {v}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <GlassModal onClose={onClose} className="max-w-4xl h-[800px]">
            {/* Header */}
            <div className="p-8 pb-4 relative z-10">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-white">Create a Group</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors">
                        <FiX size={24} />
                    </button>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mb-2">
                    <div
                        className="bg-orange-500 h-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                        style={{ width: `${(step / 4) * 100}%` }}
                    />
                </div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Step {step} of 4</p>
            </div>

            {/* Content */}
            <div className="flex-1 p-8 pt-0 flex flex-col justify-center overflow-y-auto custom-scrollbar">
                {renderStepContent()}
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-white/10 flex justify-between items-center bg-white/5 backdrop-blur-md">
                <button
                    onClick={handleBack}
                    disabled={step === 1}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-gray-300 transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : 'hover:bg-white/10 hover:text-white'
                        }`}
                >
                    <FiArrowLeft /> Back
                </button>
                <button
                    onClick={handleNext}
                    className="flex items-center gap-2 px-8 py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                    {step === 4 ? 'Create Group' : 'Next'} <FiArrowRight />
                </button>
            </div>
        </GlassModal>
    );
};

export default GroupCreationWizard;
