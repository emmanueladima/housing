import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiMapPin, FiDollarSign, FiCheck, FiArrowRight, FiArrowLeft, FiUpload, FiX, FiSmile } from 'react-icons/fi';
import listingService from '../services/listingService';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
console.log('CreateListingWizard Token Check:', !!MAPBOX_TOKEN);

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
        coordinates: { lat: null, lng: null }, // Add coordinates to state
    });

    const [previewImages, setPreviewImages] = useState([]);

    const amenityOptions = [
        { label: 'WiFi', value: 'WiFi' },
        { label: 'Laundry', value: 'laundry' },
        { label: 'Parking', value: 'parking' },
        { label: 'Furnished', value: 'furnished' },
        { label: 'Pet Friendly', value: 'pet-friendly' },
        { label: 'Dishwasher', value: 'dishwasher' },
        { label: 'AC', value: 'AC' },
        { label: 'Heating', value: 'heating' },
        { label: 'Gym', value: 'gym' },
        { label: 'Pool', value: 'pool' },
        { label: 'Elevator', value: 'elevator' },
        { label: 'Balcony', value: 'balcony' }
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

    const renderStepContent = () => {
        switch (step) {
            case 1: // Basics
                return (
                    <div className="text-center max-w-2xl mx-auto">
                        <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 text-orange-500">
                            <FiHome size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">The Basics</h2>
                        <p className="text-gray-500 mb-8">Let's start with the main details of your place.</p>

                        <div className="text-left space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-1">Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Spacious 2BR near Campus"
                                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder="Describe the place, roommates, and vibe..."
                                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isSublease"
                                    name="isSublease"
                                    checked={formData.isSublease}
                                    onChange={handleChange}
                                    disabled={user?.userType === 'student'}
                                    className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                />
                                <label htmlFor="isSublease" className="text-sm font-medium text-gray-700">
                                    This is a sublease
                                </label>
                            </div>
                        </div>
                    </div>
                );
            case 2: // Location
                return (
                    <div className="text-center max-w-2xl mx-auto">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-500">
                            <FiMapPin size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Location</h2>
                        <p className="text-gray-500 mb-8">Where is this place located?</p>

                        <div className="text-left space-y-4">
                            <div className="relative">
                                <label className="block text-sm font-bold text-gray-900 mb-1">Address</label>
                                <input
                                    type="text"
                                    value={addressQuery || formData.address}
                                    onChange={(e) => {
                                        setAddressQuery(e.target.value);
                                        handleChange({ target: { name: 'address', value: e.target.value } });
                                    }}
                                    placeholder="Start typing address..."
                                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                                />
                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-xl mt-1 shadow-lg max-h-60 overflow-y-auto">
                                        {suggestions.map((suggestion) => (
                                            <div
                                                key={suggestion.id}
                                                onClick={() => handleAddressSelect(suggestion)}
                                                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 text-sm"
                                            >
                                                <div className="font-bold text-gray-900">{suggestion.text}</div>
                                                <div className="text-gray-500 text-xs">{suggestion.place_name}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-1">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-1">State</label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-1">ZIP Code</label>
                                    <input
                                        type="text"
                                        name="zipCode"
                                        value={formData.zipCode}
                                        onChange={handleChange}
                                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-1">University</label>
                                    <input
                                        type="text"
                                        name="university"
                                        value={formData.university}
                                        onChange={handleChange}
                                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 3: // Details
                return (
                    <div className="text-center max-w-2xl mx-auto">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                            <FiDollarSign size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Details & Rent</h2>
                        <p className="text-gray-500 mb-8">The nitty-gritty details.</p>

                        <div className="text-left space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-1">Monthly Rent ($)</label>
                                    <input
                                        type="number"
                                        name="rent"
                                        value={formData.rent}
                                        onChange={handleChange}
                                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-1">Lease Term</label>
                                    <select
                                        name="leaseTerm"
                                        value={formData.leaseTerm}
                                        onChange={handleChange}
                                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none bg-white"
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
                                    <label className="block text-sm font-bold text-gray-900 mb-1">Bedrooms</label>
                                    <input
                                        type="number"
                                        name="bedrooms"
                                        value={formData.bedrooms}
                                        onChange={handleChange}
                                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-1">Bathrooms</label>
                                    <input
                                        type="number"
                                        name="bathrooms"
                                        value={formData.bathrooms}
                                        onChange={handleChange}
                                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-1">Sq Ft</label>
                                    <input
                                        type="number"
                                        name="sqft"
                                        value={formData.sqft}
                                        onChange={handleChange}
                                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-1">Available Date</label>
                                <input
                                    type="date"
                                    name="availableDate"
                                    value={formData.availableDate}
                                    onChange={handleChange}
                                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                );
            case 4: // Amenities
                return (
                    <div className="text-center max-w-2xl mx-auto">
                        <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6 text-purple-500">
                            <FiSmile size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Amenities</h2>
                        <p className="text-gray-500 mb-8">What makes this place special?</p>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-left">
                            {amenityOptions.map(option => (
                                <label key={option.value} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${formData.amenities.includes(option.value)
                                    ? 'border-orange-500 bg-orange-50'
                                    : 'border-gray-200 hover:border-orange-200'
                                    }`}>
                                    <input
                                        type="checkbox"
                                        checked={formData.amenities.includes(option.value)}
                                        onChange={() => handleAmenityToggle(option.value)}
                                        className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                    />
                                    <span className="font-medium text-gray-700">{option.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                );
            case 5: // Photos
                return (
                    <div className="text-center max-w-2xl mx-auto">
                        <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6 text-pink-500">
                            <FiUpload size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Photos</h2>
                        <p className="text-gray-500 mb-8">Show off the place! (Max 5)</p>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {previewImages.map((src, index) => (
                                <div key={index} className="relative aspect-square rounded-xl overflow-hidden group shadow-sm">
                                    <img src={src} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                                    >
                                        <FiX size={14} />
                                    </button>
                                </div>
                            ))}

                            {previewImages.length < 5 && (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:border-orange-500 hover:text-orange-500 transition-colors bg-gray-50"
                                >
                                    <FiUpload size={32} />
                                    <span className="text-sm font-bold mt-2">Add Photo</span>
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
                        {error && <p className="text-red-500 mt-4 font-medium">{error}</p>}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden min-h-[600px] flex flex-col">
                    {/* Header */}
                    <div className="p-8 border-b border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl font-black text-gray-900">List a Place</h1>
                            <button onClick={() => navigate('/listings')} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
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
                    <div className="flex-1 p-8 flex flex-col justify-center">
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
                            {loading ? 'Creating...' : (step === 5 ? 'Publish Listing' : 'Next')} <FiArrowRight />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateListingWizard;
