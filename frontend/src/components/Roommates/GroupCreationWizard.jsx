import React, { useState, useRef } from 'react';
import { FiX, FiUsers, FiDollarSign, FiSmile, FiArrowRight, FiArrowLeft, FiCheck, FiImage } from 'react-icons/fi';

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
                    <div className="text-center">
                        <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 text-orange-500">
                            <FiUsers size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Let's start with the basics</h2>
                        <p className="text-gray-500 mb-8">Give your group a catchy name and description.</p>

                        <div className="text-left space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-1">
                                    Group Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g., The Study Hub, Weekend Warriors"
                                    className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all ${errors.name ? 'border-red-400' : 'border-orange-200'}`}
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-1">Short Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder="Tell potential roommates what your group is about..."
                                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none"
                                />
                            </div>

                            {/* Group Image Upload */}
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-1">Group Photo</label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-orange-400 transition-colors"
                                >
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Group preview" className="w-24 h-24 object-cover rounded-xl mx-auto" />
                                    ) : (
                                        <>
                                            <FiImage className="mx-auto text-gray-400 mb-2" size={24} />
                                            <p className="text-sm text-gray-500">Click to upload an image</p>
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
                    <div className="text-center">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-500">
                            <FiDollarSign size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Budget & Size</h2>
                        <p className="text-gray-500 mb-8">Set your budget and how many roommates you're looking for.</p>

                        <div className="text-left space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-1">
                                        Max Budget ($) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="budget"
                                        value={formData.budget}
                                        onChange={handleChange}
                                        placeholder="1200"
                                        className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none ${errors.budget ? 'border-red-400' : 'border-gray-200'}`}
                                    />
                                    {errors.budget && <p className="text-red-500 text-xs mt-1">{errors.budget}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-1">
                                        Looking For <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="lookingFor"
                                        value={formData.lookingFor}
                                        onChange={handleChange}
                                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                                    >
                                        {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} Roommate{n > 1 ? 's' : ''}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 3:
                const vibes = ['Studious', 'Chill', 'Party', 'Clean', 'Gamers', 'Night Owls', 'Early Birds', 'Fitness', 'Music'];
                return (
                    <div className="text-center">
                        <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6 text-teal-500">
                            <FiSmile size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">What's the vibe?</h2>
                        <p className="text-gray-500 mb-8">Select tags that best describe your group.</p>

                        <div className="flex flex-wrap justify-center gap-3">
                            {vibes.map(v => (
                                <button
                                    key={v}
                                    onClick={() => toggleVibe(v)}
                                    className={`px-6 py-3 rounded-full font-bold text-sm transition-all ${formData.vibe.includes(v)
                                        ? 'bg-black text-white shadow-lg scale-105'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                    <div className="text-center">
                        <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6 text-purple-500">
                            <FiCheck size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Ready to launch?</h2>
                        <p className="text-gray-500 mb-8">Review your group details before creating.</p>

                        <div className="bg-gray-50 rounded-2xl p-6 text-left space-y-3">
                            {imagePreview && (
                                <div className="text-center mb-4">
                                    <img src={imagePreview} alt="Group" className="w-20 h-20 object-cover rounded-xl mx-auto" />
                                </div>
                            )}
                            <div>
                                <span className="text-xs font-bold text-gray-500 uppercase">Name</span>
                                <p className="font-bold text-gray-900 text-lg">{formData.name}</p>
                            </div>
                            {formData.description && (
                                <div>
                                    <span className="text-xs font-bold text-gray-500 uppercase">Description</span>
                                    <p className="text-gray-700">{formData.description}</p>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs font-bold text-gray-500 uppercase">Budget</span>
                                    <p className="font-bold text-gray-900">${formData.budget}/mo</p>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-gray-500 uppercase">Looking For</span>
                                    <p className="font-bold text-gray-900">{formData.lookingFor} roommate{formData.lookingFor > 1 ? 's' : ''}</p>
                                </div>
                            </div>
                            {formData.vibe.length > 0 && (
                                <div>
                                    <span className="text-xs font-bold text-gray-500 uppercase">Vibe</span>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {formData.vibe.map(v => (
                                            <span key={v} className="px-2 py-1 bg-white border border-gray-200 rounded-md text-xs font-bold text-gray-600">
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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-3xl w-full max-w-lg min-h-[600px] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 pb-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-black text-gray-900">Create a Group</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
                            <FiX size={24} />
                        </button>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mb-2">
                        <div
                            className="bg-orange-500 h-full transition-all duration-500 ease-out"
                            style={{ width: `${(step / 4) * 100}%` }}
                        />
                    </div>
                    <p className="text-xs font-bold text-gray-500">Step {step} of 4</p>
                </div>

                {/* Content */}
                <div className="flex-1 p-8 flex flex-col justify-center overflow-y-auto">
                    {renderStepContent()}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
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
                        className="flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        {step === 4 ? 'Create Group' : 'Next'} <FiArrowRight />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GroupCreationWizard;
