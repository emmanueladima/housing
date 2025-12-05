import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiMapPin, FiDollarSign, FiCheck, FiArrowRight, FiArrowLeft, FiUpload, FiX, FiGrid, FiImage, FiCheckCircle } from 'react-icons/fi';
import listingService from '../services/listingService';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import ModernBackground from '../components/shared/ModernBackground';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const CreateListingWizard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    // Address Autocomplete State
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [addressQuery, setAddressQuery] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        rent: '',
        bedrooms: '',
        bathrooms: '',
        sqft: '',
        university: user?.school || 'Oregon State University',
        leaseTerm: 'academic-year',
        availableDate: '',
        isSublease: user?.userType === 'student',
        amenities: [],
        images: [],
        originalLeaseEnd: '',
        reason: '',
        coordinates: { lat: null, lng: null },
    });

    const [previewImages, setPreviewImages] = useState([]);

    const amenityOptions = [
        { label: 'WiFi', value: 'WiFi', icon: '📶' },
        { label: 'Laundry', value: 'laundry', icon: '🧺' },
        { label: 'Parking', value: 'parking', icon: '🚗' },
        { label: 'Furnished', value: 'furnished', icon: '🛋️' },
        { label: 'Pet Friendly', value: 'pet-friendly', icon: '🐕' },
        { label: 'Dishwasher', value: 'dishwasher', icon: '🍽️' },
        { label: 'AC', value: 'AC', icon: '❄️' },
        { label: 'Heating', value: 'heating', icon: '🔥' },
        { label: 'Gym', value: 'gym', icon: '💪' },
        { label: 'Pool', value: 'pool', icon: '🏊' },
        { label: 'Elevator', value: 'elevator', icon: '🛗' },
        { label: 'Balcony', value: 'balcony', icon: '🌅' }
    ];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Mapbox Address Search
    useEffect(() => {
        const searchAddress = async () => {
            if (addressQuery.length < 3) {
                setSuggestions([]);
                return;
            }

            try {
                const response = await axios.get(
                    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(addressQuery)}.json?access_token=${MAPBOX_TOKEN}&types=address&country=us`
                );
                setSuggestions(response.data.features);
                setShowSuggestions(true);
            } catch (error) {
                console.error('Error fetching address suggestions:', error);
            }
        };

        const timeoutId = setTimeout(() => {
            if (addressQuery && addressQuery !== formData.address) {
                searchAddress();
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [addressQuery, formData.address]);

    const handleAddressSelect = (feature) => {
        const context = feature.context || [];
        const city = context.find(c => c.id.startsWith('place'))?.text || '';
        const state = context.find(c => c.id.startsWith('region'))?.text || '';
        const zipCode = context.find(c => c.id.startsWith('postcode'))?.text || '';
        const [lng, lat] = feature.center;

        setFormData(prev => ({
            ...prev,
            address: feature.place_name.split(',')[0],
            city,
            state,
            zipCode,
            coordinates: { lat, lng }
        }));

        setAddressQuery(feature.place_name.split(',')[0]);
        setShowSuggestions(false);
    };

    const handleAmenityToggle = (amenityValue) => {
        setFormData(prev => {
            const newAmenities = prev.amenities.includes(amenityValue)
                ? prev.amenities.filter(a => a !== amenityValue)
                : [...prev.amenities, amenityValue];
            return { ...prev, amenities: newAmenities };
        });
    };

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + formData.images.length > 5) {
            alert('Maximum 5 images allowed');
            return;
        }

        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...files]
        }));

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviewImages(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
        setPreviewImages(prev => prev.filter((_, i) => i !== index));
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
        setError('');
        try {
            if (formData.images.length === 0) {
                throw new Error('Please upload at least one image');
            }
            await listingService.createListing(formData);
            navigate('/listings');
        } catch (err) {
            console.error('Error creating listing:', err);
            setError(err.response?.data?.error || err.message || 'Failed to create listing');
            setLoading(false);
        }
    };

    const steps = [
        { num: 1, label: 'Basics', icon: FiHome },
        { num: 2, label: 'Location', icon: FiMapPin },
        { num: 3, label: 'Details', icon: FiDollarSign },
        { num: 4, label: 'Amenities', icon: FiGrid },
        { num: 5, label: 'Photos', icon: FiImage },
    ];

    const renderStepContent = () => {
        switch (step) {
            case 1: // Basics
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Listing Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Spacious 2BR near Campus"
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="5"
                                placeholder="Describe the place, roommates, and vibe..."
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white outline-none resize-none transition-all"
                            />
                        </div>
                        <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    id="isSublease"
                                    name="isSublease"
                                    checked={formData.isSublease}
                                    onChange={handleChange}
                                    disabled={user?.userType === 'student'}
                                    className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                />
                                <div>
                                    <span className="font-bold text-gray-900">This is a sublease</span>
                                    <p className="text-sm text-gray-500">Check if you're subleasing your current lease</p>
                                </div>
                            </label>
                        </div>
                    </div>
                );
            case 2: // Location
                return (
                    <div className="space-y-6">
                        <div className="relative">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Street Address</label>
                            <input
                                type="text"
                                value={addressQuery || formData.address}
                                onChange={(e) => setAddressQuery(e.target.value)}
                                placeholder="Start typing address..."
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white outline-none transition-all"
                            />
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-2xl mt-2 shadow-xl max-h-60 overflow-y-auto">
                                    {suggestions.map((suggestion) => (
                                        <div
                                            key={suggestion.id}
                                            onClick={() => handleAddressSelect(suggestion)}
                                            className="p-4 hover:bg-orange-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors"
                                        >
                                            <div className="font-bold text-gray-900">{suggestion.text}</div>
                                            <div className="text-gray-500 text-sm">{suggestion.place_name}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">State</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">ZIP Code</label>
                                <input
                                    type="text"
                                    name="zipCode"
                                    value={formData.zipCode}
                                    onChange={handleChange}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Nearby University</label>
                                <input
                                    type="text"
                                    name="university"
                                    value={formData.university}
                                    onChange={handleChange}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                );
            case 3: // Details
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Monthly Rent</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                                    <input
                                        type="number"
                                        name="rent"
                                        value={formData.rent}
                                        onChange={handleChange}
                                        placeholder="0"
                                        className="w-full p-4 pl-8 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Lease Term</label>
                                <select
                                    name="leaseTerm"
                                    value={formData.leaseTerm}
                                    onChange={handleChange}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white outline-none transition-all"
                                >
                                    <option value="academic-year">Academic Year</option>
                                    <option value="1-year">1 Year</option>
                                    <option value="6-months">6 Months</option>
                                    <option value="month-to-month">Month-to-Month</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Bedrooms</label>
                                <input
                                    type="number"
                                    name="bedrooms"
                                    value={formData.bedrooms}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white outline-none text-center transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Bathrooms</label>
                                <input
                                    type="number"
                                    name="bathrooms"
                                    value={formData.bathrooms}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.5"
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white outline-none text-center transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Sq Ft</label>
                                <input
                                    type="number"
                                    name="sqft"
                                    value={formData.sqft}
                                    onChange={handleChange}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white outline-none text-center transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Available Date</label>
                            <input
                                type="date"
                                name="availableDate"
                                value={formData.availableDate}
                                onChange={handleChange}
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white outline-none transition-all"
                            />
                        </div>
                    </div>
                );
            case 4: // Amenities
                return (
                    <div className="space-y-4">
                        <p className="text-gray-500 text-sm mb-4">Select all that apply</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {amenityOptions.map(option => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleAmenityToggle(option.value)}
                                    className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-3 ${formData.amenities.includes(option.value)
                                        ? 'border-orange-500 bg-orange-50 shadow-sm'
                                        : 'border-gray-200 hover:border-orange-200 bg-white'
                                        }`}
                                >
                                    <span className="text-2xl">{option.icon}</span>
                                    <span className="font-medium text-gray-900">{option.label}</span>
                                    {formData.amenities.includes(option.value) && (
                                        <FiCheckCircle className="ml-auto text-orange-500" size={20} />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 5: // Photos
                return (
                    <div className="space-y-6">
                        <p className="text-gray-500 text-sm">Add up to 5 photos. First photo will be the cover.</p>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {previewImages.map((src, index) => (
                                <div key={index} className="relative aspect-square rounded-2xl overflow-hidden group shadow-sm border border-gray-200">
                                    <img src={src} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                    {index === 0 && (
                                        <div className="absolute top-2 left-2 px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded-lg">
                                            Cover
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                                    >
                                        <FiX size={14} />
                                    </button>
                                </div>
                            ))}

                            {previewImages.length < 5 && (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-square border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-500 hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50 transition-all bg-gray-50"
                                >
                                    <FiUpload size={32} />
                                    <span className="text-sm font-bold mt-2">Add Photo</span>
                                    <span className="text-xs text-gray-400 mt-1">{5 - previewImages.length} remaining</span>
                                </button>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageSelect}
                            multiple
                            accept="image/*"
                            className="hidden"
                        />
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 font-medium">
                                {error}
                            </div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Header */}
            <div className="relative overflow-hidden pt-24 pb-12">
                <ModernBackground />
                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                    <h1 className="text-4xl font-black text-white mb-3">List Your Place</h1>
                    <p className="text-white/80">Get your listing in front of thousands of students</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-3xl mx-auto px-4 -mt-8 pb-24 relative z-10">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden min-h-[600px] flex flex-col">
                    {/* Progress Steps */}
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex justify-between items-center">
                            {steps.map((s, i) => (
                                <div key={s.num} className="flex items-center">
                                    <div className={`flex flex-col items-center ${step >= s.num ? 'text-orange-600' : 'text-gray-400'}`}>
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1 transition-all ${step > s.num
                                            ? 'bg-orange-500 text-white'
                                            : step === s.num
                                                ? 'bg-orange-100 text-orange-600 ring-2 ring-orange-500'
                                                : 'bg-gray-100 text-gray-400'
                                            }`}>
                                            {step > s.num ? <FiCheck size={18} /> : <s.icon size={18} />}
                                        </div>
                                        <span className="text-xs font-bold hidden sm:block">{s.label}</span>
                                    </div>
                                    {i < steps.length - 1 && (
                                        <div className={`w-12 md:w-20 h-0.5 mx-2 transition-colors ${step > s.num ? 'bg-orange-500' : 'bg-gray-200'}`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Step Content */}
                    <div className="p-8 flex-1">
                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-gray-900 mb-1">{steps[step - 1].label}</h2>
                            <p className="text-gray-500">
                                {step === 1 && "Start with the main details of your place"}
                                {step === 2 && "Where is this place located?"}
                                {step === 3 && "The nitty-gritty details"}
                                {step === 4 && "What makes this place special?"}
                                {step === 5 && "Show off the place with great photos"}
                            </p>
                        </div>
                        {renderStepContent()}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center mt-auto">
                        <button
                            onClick={handleBack}
                            disabled={step === 1}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${step === 1
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            <FiArrowLeft /> Back
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={loading}
                            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating...' : (step === 5 ? 'Publish Listing' : 'Continue')} <FiArrowRight />
                        </button>
                    </div>
                </div>

                {/* Cancel Link */}
                <div className="text-center mt-6">
                    <button
                        onClick={() => navigate('/listings')}
                        className="text-gray-500 hover:text-gray-700 font-medium"
                    >
                        Cancel and go back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateListingWizard;
