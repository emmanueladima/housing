import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiX, FiHome, FiDollarSign, FiMapPin, FiCalendar } from 'react-icons/fi';
import listingService from '../services/listingService';
import { useAuth } from '../contexts/AuthContext';
import AddressAutocomplete from '../components/shared/AddressAutocomplete';

const CreateListing = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

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
        isSublease: user?.userType === 'student', // Default to true for students
        amenities: [],
        images: [],
        // Sublease specific
        originalLeaseEnd: '',
        reason: '',
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
        if (files.length > 5) {
            alert('Maximum 5 images allowed');
            return;
        }

        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...files]
        }));

        // Create previews
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Validate required fields
            if (formData.images.length === 0) {
                throw new Error('Please upload at least one image');
            }

            await listingService.createListing(formData);
            navigate('/listings');
        } catch (err) {
            console.error('Error creating listing:', err);
            setError(err.response?.data?.error || err.message || 'Failed to create listing');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-orange-50">
                        <h1 className="text-2xl font-bold text-gray-900">
                            {formData.isSublease ? 'List a Sublease' : 'Create New Listing'}
                        </h1>
                        <p className="text-gray-600 text-sm mt-1">
                            Fill in the details below to post your place.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {/* Basic Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <FiHome /> Basic Information
                            </h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Spacious 2BR near Campus"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="4"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    required
                                />
                            </div>

                            {/* Sublease Toggle (Only for students or if manually toggled) */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isSublease"
                                    name="isSublease"
                                    checked={formData.isSublease}
                                    onChange={handleChange}
                                    disabled={user?.userType === 'student'} // Students must sublease
                                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                />
                                <label htmlFor="isSublease" className="text-sm font-medium text-gray-700">
                                    This is a sublease
                                </label>
                            </div>

                            {formData.isSublease && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-orange-50 p-4 rounded-lg">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Original Lease Ends</label>
                                        <input
                                            type="date"
                                            name="originalLeaseEnd"
                                            value={formData.originalLeaseEnd}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                            required={formData.isSublease}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Subletting</label>
                                        <input
                                            type="text"
                                            name="reason"
                                            value={formData.reason}
                                            onChange={handleChange}
                                            placeholder="e.g. Summer internship"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <hr className="border-gray-200" />

                        {/* Location */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <FiMapPin /> Location
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <AddressAutocomplete
                                        value={formData.address}
                                        onChange={(val) => setFormData(prev => ({ ...prev, address: val }))}
                                        onSelect={(data) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                address: data.street,
                                                city: data.city,
                                                state: data.state,
                                                zipCode: data.zipCode,
                                                coordinates: data.coordinates
                                            }));
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                                    <input
                                        type="text"
                                        name="zipCode"
                                        value={formData.zipCode}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
                                    <input
                                        type="text"
                                        name="university"
                                        value={formData.university}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <hr className="border-gray-200" />

                        {/* Details */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <FiDollarSign /> Details
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent ($)</label>
                                    <input
                                        type="number"
                                        name="rent"
                                        value={formData.rent}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                                    <input
                                        type="number"
                                        name="bedrooms"
                                        value={formData.bedrooms}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                                    <input
                                        type="number"
                                        name="bathrooms"
                                        value={formData.bathrooms}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Square Ft</label>
                                    <input
                                        type="number"
                                        name="sqft"
                                        value={formData.sqft}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Available Date</label>
                                    <input
                                        type="date"
                                        name="availableDate"
                                        value={formData.availableDate}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Lease Term</label>
                                    <select
                                        name="leaseTerm"
                                        value={formData.leaseTerm}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    >
                                        <option value="academic-year">Academic Year</option>
                                        <option value="1-year">1 Year</option>
                                        <option value="6-months">6 Months</option>
                                        <option value="month-to-month">Month-to-Month</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <hr className="border-gray-200" />

                        {/* Amenities */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">Amenities</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {amenityOptions.map(option => (
                                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.amenities.includes(option.value)}
                                            onChange={() => handleAmenityToggle(option.value)}
                                            className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                        />
                                        <span className="text-sm text-gray-700">{option.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <hr className="border-gray-200" />

                        {/* Images */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <FiUpload /> Photos
                            </h3>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {previewImages.map((src, index) => (
                                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                                        <img src={src} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <FiX size={14} />
                                        </button>
                                    </div>
                                ))}

                                {previewImages.length < 5 && (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-orange-500 hover:text-orange-500 transition-colors"
                                    >
                                        <FiUpload size={24} />
                                        <span className="text-xs mt-1">Add Photo</span>
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
                            <p className="text-xs text-gray-500">Upload up to 5 photos. First photo will be the cover.</p>
                        </div>

                        <div className="flex justify-end pt-6">
                            <button
                                type="button"
                                onClick={() => navigate('/listings')}
                                className="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium mr-4"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium disabled:opacity-50 flex items-center gap-2"
                            >
                                {loading ? 'Creating...' : 'Create Listing'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateListing;
