import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiTrash2, FiImage, FiX, FiHome, FiDollarSign, FiMapPin, FiCheck, FiGrid } from 'react-icons/fi';
import listingService from '../services/listingService';
import loadingSpinner from '../components/shared/LoadingSpinner';
import ModernBackground from '../components/shared/ModernBackground';
import { Card } from '@heroui/card';

const EditListing = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        rent: '',
        bedrooms: '',
        bathrooms: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        propertyType: 'apartment',
        isActive: true,
        amenities: [],
    });

    const [existingImages, setExistingImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [imagesToRemove, setImagesToRemove] = useState([]);

    const amenityOptions = [
        { label: 'In-Unit Laundry', value: 'in-unit-laundry', icon: '🧺' },
        { label: 'Parking', value: 'parking', icon: '🚗' },
        { label: 'Pet Friendly', value: 'pet-friendly', icon: '🐕' },
        { label: 'Gym', value: 'gym', icon: '💪' },
        { label: 'Pool', value: 'pool', icon: '🏊' },
        { label: 'Air Conditioning', value: 'ac', icon: '❄️' },
        { label: 'Dishwasher', value: 'dishwasher', icon: '🍽️' },
        { label: 'Furnished', value: 'furnished', icon: '🛋️' },
    ];

    useEffect(() => {
        fetchListing();
    }, [id]);

    const fetchListing = async () => {
        try {
            const listing = await listingService.getListing(id);
            setFormData({
                title: listing.title || '',
                description: listing.description || '',
                rent: listing.rent || '',
                bedrooms: listing.bedrooms || '',
                bathrooms: listing.bathrooms || '',
                address: listing.address || '',
                city: listing.city || '',
                state: listing.state || '',
                zipCode: listing.zipCode || '',
                propertyType: listing.propertyType || 'apartment',
                isActive: listing.isActive !== false,
                amenities: listing.amenities || [],
            });
            setExistingImages(listing.images || []);
        } catch (err) {
            setError('Failed to load listing');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAmenityToggle = (value) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(value)
                ? prev.amenities.filter(a => a !== value)
                : [...prev.amenities, value]
        }));
    };

    const handleNewImages = (e) => {
        const files = Array.from(e.target.files);
        setNewImages(prev => [...prev, ...files]);
    };

    const removeExistingImage = (imageUrl) => {
        setExistingImages(prev => prev.filter(img => img !== imageUrl));
        setImagesToRemove(prev => [...prev, imageUrl]);
    };

    const removeNewImage = (index) => {
        setNewImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const updateData = {
                ...formData,
                existingImages: existingImages,
                imagesToRemove: imagesToRemove,
                images: newImages,
            };

            await listingService.updateListing(id, updateData);
            setSuccess('Listing updated successfully!');
            setTimeout(() => navigate('/landlord/dashboard'), 1500);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update listing');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await listingService.deleteListing(id);
            navigate('/landlord/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete listing');
            setDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    // Input styling
    const inputClasses = "w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white transition-all duration-200 text-gray-900 placeholder-gray-400";
    const labelClasses = "block text-sm font-semibold text-gray-700 mb-2";

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-teal-50">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-gray-50 to-teal-50/30 pb-24">
            {/* Header */}
            <div className="relative h-44 sm:h-56 overflow-hidden">
                <ModernBackground />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <h1 className="text-2xl sm:text-4xl font-black text-white drop-shadow-lg">Edit Listing</h1>
                    <p className="text-white/80 mt-2 text-sm sm:text-base">Update your property details</p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 -mt-10 sm:-mt-14 relative z-10">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/landlord/dashboard')}
                    className="mb-6 flex items-center gap-2 text-gray-600 hover:text-orange-600 font-medium bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-gray-100 transition-all duration-200"
                >
                    <FiArrowLeft /> Back to Dashboard
                </button>

                {/* Messages */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 flex items-center gap-2 shadow-sm">
                        <span className="text-xl">⚠️</span> {error}
                    </div>
                )}
                {success && (
                    <div className="mb-6 p-4 bg-teal-50 border border-teal-200 rounded-2xl text-teal-700 flex items-center gap-2 shadow-sm">
                        <FiCheck className="text-teal-500" size={20} /> {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <Card isBlurred className="bg-white/60 dark:bg-default-100/50 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 shadow-lg border-none">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <span className="p-2.5 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl shadow-sm">
                                <FiHome className="text-orange-600" size={20} />
                            </span>
                            Basic Information
                        </h2>

                        <div className="space-y-5">
                            <div>
                                <label className={labelClasses}>Title <span className="text-orange-500">*</span></label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g., Modern 2BR Near Campus"
                                    className={inputClasses}
                                    required
                                />
                            </div>

                            <div>
                                <label className={labelClasses}>Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Describe your property..."
                                    className={`${inputClasses} resize-none`}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className={labelClasses}>Rent <span className="text-orange-500">*</span></label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                        <input
                                            type="number"
                                            name="rent"
                                            value={formData.rent}
                                            onChange={handleChange}
                                            placeholder="1200"
                                            className={`${inputClasses} pl-8`}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClasses}>Beds <span className="text-orange-500">*</span></label>
                                    <input
                                        type="number"
                                        name="bedrooms"
                                        value={formData.bedrooms}
                                        onChange={handleChange}
                                        placeholder="2"
                                        className={inputClasses}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses}>Baths <span className="text-orange-500">*</span></label>
                                    <input
                                        type="number"
                                        name="bathrooms"
                                        value={formData.bathrooms}
                                        onChange={handleChange}
                                        placeholder="1"
                                        className={inputClasses}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={labelClasses}>Property Type</label>
                                <select
                                    name="propertyType"
                                    value={formData.propertyType}
                                    onChange={handleChange}
                                    className={inputClasses}
                                >
                                    <option value="apartment">🏢 Apartment</option>
                                    <option value="house">🏠 House</option>
                                    <option value="condo">🏙️ Condo</option>
                                    <option value="townhouse">🏘️ Townhouse</option>
                                    <option value="room">🚪 Room</option>
                                </select>
                            </div>
                        </div>
                    </Card>

                    {/* Location */}
                    <Card isBlurred className="bg-white/60 dark:bg-default-100/50 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 shadow-lg border-none">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <span className="p-2.5 bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl shadow-sm">
                                <FiMapPin className="text-teal-600" size={20} />
                            </span>
                            Location
                        </h2>

                        <div className="space-y-5">
                            <div>
                                <label className={labelClasses}>Street Address <span className="text-orange-500">*</span></label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="123 Main Street"
                                    className={inputClasses}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className={labelClasses}>City <span className="text-orange-500">*</span></label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="Corvallis"
                                        className={inputClasses}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses}>State <span className="text-orange-500">*</span></label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        placeholder="Oregon"
                                        className={inputClasses}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses}>ZIP <span className="text-orange-500">*</span></label>
                                    <input
                                        type="text"
                                        name="zipCode"
                                        value={formData.zipCode}
                                        onChange={handleChange}
                                        placeholder="97330"
                                        className={inputClasses}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Images */}
                    <Card isBlurred className="bg-white/60 dark:bg-default-100/50 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 shadow-lg border-none">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <span className="p-2.5 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl shadow-sm">
                                <FiImage className="text-purple-600" size={20} />
                            </span>
                            Photos
                        </h2>

                        {/* Existing Images */}
                        {existingImages.length > 0 && (
                            <div className="mb-6">
                                <p className="text-sm font-medium text-gray-600 mb-3">Current Photos</p>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                    {existingImages.map((img, idx) => (
                                        <div key={idx} className="relative group aspect-square">
                                            <img
                                                src={img}
                                                alt={`Listing ${idx + 1}`}
                                                className="w-full h-full object-cover rounded-xl ring-2 ring-gray-100 shadow-sm transition-transform group-hover:scale-105"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeExistingImage(img)}
                                                className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg hover:bg-red-600 hover:scale-110"
                                            >
                                                <FiX size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* New Images */}
                        {newImages.length > 0 && (
                            <div className="mb-6">
                                <p className="text-sm font-medium text-gray-600 mb-3">New Photos to Add</p>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                    {newImages.map((file, idx) => (
                                        <div key={idx} className="relative group aspect-square">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`New ${idx + 1}`}
                                                className="w-full h-full object-cover rounded-xl ring-2 ring-teal-200 shadow-sm transition-transform group-hover:scale-105"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeNewImage(idx)}
                                                className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg hover:bg-red-600 hover:scale-110"
                                            >
                                                <FiX size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <label className="block cursor-pointer">
                            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-orange-400 hover:bg-orange-50/50 transition-all duration-200 group">
                                <div className="w-14 h-14 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-orange-100 transition-colors">
                                    <FiImage className="text-gray-400 group-hover:text-orange-500 transition-colors" size={28} />
                                </div>
                                <p className="text-gray-600 font-medium">Click to add more photos</p>
                                <p className="text-gray-400 text-sm mt-1">PNG, JPG up to 10MB</p>
                            </div>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleNewImages}
                                className="hidden"
                            />
                        </label>
                    </Card>

                    {/* Amenities */}
                    <Card isBlurred className="bg-white/60 dark:bg-default-100/50 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 shadow-lg border-none">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <span className="p-2.5 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl shadow-sm">
                                <FiGrid className="text-blue-600" size={20} />
                            </span>
                            Amenities
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {amenityOptions.map(amenity => (
                                <button
                                    key={amenity.value}
                                    type="button"
                                    onClick={() => handleAmenityToggle(amenity.value)}
                                    className={`p-4 rounded-xl border-2 text-left transition-all duration-200 hover:scale-[1.02] active:scale-95 ${formData.amenities.includes(amenity.value)
                                        ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 shadow-md'
                                        : 'border-white/50 bg-white/40 hover:border-orange-200 hover:bg-white/60'
                                        }`}
                                >
                                    <span className="text-2xl block mb-1 drop-shadow-sm">{amenity.icon}</span>
                                    <p className={`text-sm font-medium ${formData.amenities.includes(amenity.value) ? 'text-orange-700' : 'text-gray-700'}`}>
                                        {amenity.label}
                                    </p>
                                    {formData.amenities.includes(amenity.value) && (
                                        <FiCheck className="absolute top-2 right-2 text-orange-500" size={16} />
                                    )}
                                </button>
                            ))}
                        </div>
                    </Card>

                    {/* Status */}
                    <Card isBlurred className="bg-white/60 dark:bg-default-100/50 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 shadow-lg border-none">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Listing Status</h2>
                                <p className="text-sm text-gray-500 mt-1">Inactive listings won't appear in search</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all after:shadow-sm peer-checked:bg-gradient-to-r peer-checked:from-orange-500 peer-checked:to-orange-600 shadow-inner"></div>
                                <span className={`ml-4 text-sm font-bold ${formData.isActive ? 'text-teal-600' : 'text-gray-400'}`}>
                                    {formData.isActive ? '✓ Active' : 'Inactive'}
                                </span>
                            </label>
                        </div>
                    </Card>

                    {/* Actions */}
                    <div className="flex gap-4 pt-2">
                        <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(true)}
                            className="px-6 py-4 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-all duration-200 flex items-center gap-2 border border-red-200 hover:shadow-md"
                        >
                            <FiTrash2 size={18} /> Delete
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg hover:shadow-xl"
                        >
                            {saving ? <LoadingSpinner size="sm" /> : <FiSave size={18} />}
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                        <div className="w-16 h-16 mx-auto bg-red-100 rounded-2xl flex items-center justify-center mb-4">
                            <FiTrash2 className="text-red-500" size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">Delete Listing?</h3>
                        <p className="text-gray-600 text-center mb-8">
                            This action cannot be undone. The listing will be permanently removed.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex-1 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl font-bold hover:from-red-600 hover:to-red-700 transition-all duration-200 disabled:opacity-50"
                            >
                                {deleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditListing;
