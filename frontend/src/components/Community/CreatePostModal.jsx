import React, { useState, useEffect } from 'react';
import { FiX, FiHome, FiKey, FiUsers, FiShoppingBag, FiBook, FiMoreHorizontal, FiSearch, FiEye, FiTag, FiDollarSign, FiMapPin, FiImage, FiCheck, FiArrowRight, FiArrowLeft, FiLink } from 'react-icons/fi';
import communityService from '../../services/communityService';
import api from '../../services/api';

const channels = [
    { id: 'housing', label: 'Housing', icon: FiHome, color: 'orange' },
    { id: 'subleases', label: 'Subleases', icon: FiKey, color: 'teal' },
    { id: 'roommates', label: 'Roommates', icon: FiUsers, color: 'blue' },
    { id: 'furniture', label: 'Furniture', icon: FiShoppingBag, color: 'purple' },
    { id: 'study-groups', label: 'Study Groups', icon: FiBook, color: 'green' },
    { id: 'misc', label: 'Misc', icon: FiMoreHorizontal, color: 'gray' },
];

// All available intents
const allIntents = {
    'looking-for': { id: 'looking-for', label: 'Looking For', description: 'You need something', color: 'blue' },
    'offering': { id: 'offering', label: 'Offering', description: 'You have something', color: 'green' },
    'selling': { id: 'selling', label: 'Selling', description: 'For sale', color: 'orange' },
    'announcement': { id: 'announcement', label: 'Announcement', description: 'Just sharing', color: 'gray' },
};

// Channel-specific intent mapping
const channelIntents = {
    'housing': ['looking-for', 'offering'],
    'subleases': ['looking-for', 'offering'],
    'roommates': ['looking-for', 'offering'],
    'furniture': ['selling', 'looking-for'],
    'study-groups': ['looking-for', 'offering', 'announcement'],
    'misc': ['looking-for', 'offering', 'announcement'],
};

const colorMap = {
    orange: 'border-orange-300 bg-orange-50 hover:border-orange-500',
    teal: 'border-teal-300 bg-teal-50 hover:border-teal-500',
    blue: 'border-blue-300 bg-blue-50 hover:border-blue-500',
    purple: 'border-purple-300 bg-purple-50 hover:border-purple-500',
    green: 'border-green-300 bg-green-50 hover:border-green-500',
    gray: 'border-gray-300 bg-gray-50 hover:border-gray-500',
};

const activeColorMap = {
    orange: 'border-orange-500 bg-orange-100 ring-2 ring-orange-500',
    teal: 'border-teal-500 bg-teal-100 ring-2 ring-teal-500',
    blue: 'border-blue-500 bg-blue-100 ring-2 ring-blue-500',
    purple: 'border-purple-500 bg-purple-100 ring-2 ring-purple-500',
    green: 'border-green-500 bg-green-100 ring-2 ring-green-500',
    gray: 'border-gray-500 bg-gray-100 ring-2 ring-gray-500',
};

const CreatePostModal = ({ isOpen, onClose, onCreated, onUpdated, editPost }) => {
    const isEditing = !!editPost;
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        channel: '',
        intent: '',
        title: '',
        description: '',
        price: '',
        budgetMin: '',
        budgetMax: '',
        location: '',
        tags: [],
        linkedListing: '',
        linkedGroup: '',
    });
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [myListings, setMyListings] = useState([]);
    const [myGroup, setMyGroup] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen && step === 3) {
            fetchUserAssets();
        }
    }, [isOpen, step]);

    // Populate form when editing
    useEffect(() => {
        if (isOpen && editPost) {
            setFormData({
                channel: editPost.channel || '',
                intent: editPost.intent || '',
                title: editPost.title || '',
                description: editPost.description || '',
                price: editPost.price?.toString() || '',
                budgetMin: editPost.budgetMin?.toString() || '',
                budgetMax: editPost.budgetMax?.toString() || '',
                location: editPost.location || '',
                tags: editPost.tags || [],
                linkedListing: editPost.linkedListing?._id || editPost.linkedListing || '',
                linkedGroup: editPost.linkedGroup?._id || editPost.linkedGroup || '',
            });
            // Set existing image previews
            if (editPost.images && editPost.images.length > 0) {
                setImagePreviews(editPost.images);
            }
            // Skip step 1 if already has channel and intent
            if (editPost.channel && editPost.intent) {
                setStep(2);
            }
        } else if (isOpen && !editPost) {
            // Reset form for new post
            setStep(1);
            setFormData({
                channel: '', intent: '', title: '', description: '',
                price: '', budgetMin: '', budgetMax: '', location: '', tags: [],
                linkedListing: '', linkedGroup: ''
            });
            setImages([]);
            setImagePreviews([]);
            setErrors({});
        }
    }, [isOpen, editPost]);

    const fetchUserAssets = async () => {
        try {
            const [listingsRes, groupRes] = await Promise.allSettled([
                api.get('/listings/my-listings'),
                api.get('/roommate-groups/my-group')
            ]);
            if (listingsRes.status === 'fulfilled') {
                setMyListings(listingsRes.value.data.listings || listingsRes.value.data || []);
            }
            if (groupRes.status === 'fulfilled') {
                setMyGroup(groupRes.value.data);
            }
        } catch (err) {
            console.error('Error fetching user assets:', err);
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files).slice(0, 5 - images.length);
        setImages([...images, ...files]);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews([...imagePreviews, ...newPreviews]);
    };

    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
        setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    };

    const addTag = () => {
        if (tagInput.trim() && formData.tags.length < 5) {
            setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
            setTagInput('');
        }
    };

    const removeTag = (index) => {
        setFormData({ ...formData, tags: formData.tags.filter((_, i) => i !== index) });
    };

    const validateStep = () => {
        const newErrors = {};

        if (step === 1) {
            if (!formData.channel) newErrors.channel = 'Select a channel';
            if (!formData.intent) newErrors.intent = 'Select an intent';
        }

        if (step === 2) {
            if (!formData.title || formData.title.length < 10) {
                newErrors.title = 'Title must be at least 10 characters';
            }
            if (!formData.description || formData.description.length < 20) {
                newErrors.description = 'Description must be at least 20 characters';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep()) {
            setStep(step + 1);
        }
    };

    const handleSubmit = async () => {
        if (!validateStep()) return;

        setLoading(true);
        try {
            const postData = {
                channel: formData.channel,
                intent: formData.intent,
                title: formData.title,
                description: formData.description,
                location: formData.location || undefined,
                tags: formData.tags,
            };

            if (formData.intent === 'selling' || formData.intent === 'offering') {
                if (formData.price) postData.price = Number(formData.price);
            } else if (formData.intent === 'looking-for') {
                if (formData.budgetMin) postData.budgetMin = Number(formData.budgetMin);
                if (formData.budgetMax) postData.budgetMax = Number(formData.budgetMax);
            }

            if (formData.linkedListing) postData.linkedListing = formData.linkedListing;
            if (formData.linkedGroup) postData.linkedGroup = formData.linkedGroup;

            if (isEditing) {
                // Update existing post
                const updatedPost = await communityService.updatePost(editPost._id, postData, images);
                onUpdated && onUpdated(updatedPost);
            } else {
                // Create new post
                const post = await communityService.createPost(postData, images);
                onCreated(post);
            }
            onClose();

            // Reset form
            setStep(1);
            setFormData({
                channel: '', intent: '', title: '', description: '',
                price: '', budgetMin: '', budgetMax: '', location: '', tags: [],
                linkedListing: '', linkedGroup: ''
            });
            setImages([]);
            setImagePreviews([]);
        } catch (error) {
            console.error('Error saving post:', error);
            setErrors({ submit: error.response?.data?.error || (isEditing ? 'Failed to update post' : 'Failed to create post') });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{isEditing ? 'Edit Post' : 'Create Post'}</h2>
                        <p className="text-sm text-gray-500">Step {step} of 3</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                        <FiX size={20} />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="px-6 pt-4">
                    <div className="flex gap-2">
                        {[1, 2, 3].map(s => (
                            <div
                                key={s}
                                className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? 'bg-orange-500' : 'bg-gray-200'}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {step === 1 && (
                        <div className="space-y-6">
                            {/* Channel Selection */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3">Channel *</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {channels.map(channel => {
                                        const Icon = channel.icon;
                                        const isActive = formData.channel === channel.id;
                                        return (
                                            <button
                                                key={channel.id}
                                                type="button"
                                                onClick={() => {
                                                    const newIntents = channelIntents[channel.id] || [];
                                                    // Auto-select first intent if only one option, or reset
                                                    const newIntent = newIntents.length === 1 ? newIntents[0] : '';
                                                    setFormData({ ...formData, channel: channel.id, intent: newIntent });
                                                }}
                                                className={`p-4 rounded-2xl border-2 transition-all text-left ${isActive ? activeColorMap[channel.color] : colorMap[channel.color]
                                                    }`}
                                            >
                                                <Icon size={24} className={isActive ? 'text-gray-900' : 'text-gray-600'} />
                                                <p className="font-bold mt-2">{channel.label}</p>
                                            </button>
                                        );
                                    })}
                                </div>
                                {errors.channel && <p className="text-red-500 text-sm mt-2">{errors.channel}</p>}
                            </div>

                            {/* Intent Selection - Channel-specific */}
                            {formData.channel && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">Intent *</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {(channelIntents[formData.channel] || []).map(intentId => {
                                            const intent = allIntents[intentId];
                                            if (!intent) return null;
                                            const isActive = formData.intent === intent.id;
                                            return (
                                                <button
                                                    key={intent.id}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, intent: intent.id })}
                                                    className={`p-4 rounded-2xl border-2 transition-all text-left ${isActive ? activeColorMap[intent.color] : colorMap[intent.color]
                                                        }`}
                                                >
                                                    <p className="font-bold">{intent.label}</p>
                                                    <p className="text-sm text-gray-600">{intent.description}</p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {errors.intent && <p className="text-red-500 text-sm mt-2">{errors.intent}</p>}
                                </div>
                            )}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Title * <span className="font-normal text-gray-400">({formData.title.length}/100)</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value.slice(0, 100) })}
                                    placeholder="What are you posting about?"
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all"
                                />
                                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Description * <span className="font-normal text-gray-400">({formData.description.length}/2000)</span>
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value.slice(0, 2000) })}
                                    placeholder="Give more details about your post..."
                                    rows={4}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none resize-none transition-all"
                                />
                                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                            </div>

                            {/* Price / Budget */}
                            {(formData.intent === 'selling' || formData.intent === 'offering') && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Price ($)</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="0"
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all"
                                    />
                                </div>
                            )}

                            {formData.intent === 'looking-for' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Min Budget ($)</label>
                                        <input
                                            type="number"
                                            value={formData.budgetMin}
                                            onChange={e => setFormData({ ...formData, budgetMin: e.target.value })}
                                            placeholder="0"
                                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Max Budget ($)</label>
                                        <input
                                            type="number"
                                            value={formData.budgetMax}
                                            onChange={e => setFormData({ ...formData, budgetMax: e.target.value })}
                                            placeholder="1000"
                                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Location */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Location / Area</label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="e.g. Near campus, Downtown"
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all"
                                />
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Tags (max 5)</label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={e => setTagInput(e.target.value)}
                                        onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                        placeholder="Add a tag"
                                        className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={addTag}
                                        disabled={formData.tags.length >= 5}
                                        className="px-4 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                                    >
                                        <FiTag size={18} />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.tags.map((tag, i) => (
                                        <span key={i} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm flex items-center gap-1">
                                            {tag}
                                            <button type="button" onClick={() => removeTag(i)} className="hover:text-orange-900">
                                                <FiX size={14} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Images */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Photos (max 5)</label>
                                <div className="flex flex-wrap gap-3">
                                    {imagePreviews.map((preview, i) => (
                                        <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
                                            <img src={preview} alt="" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(i)}
                                                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                                            >
                                                <FiX size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    {images.length < 5 && (
                                        <label className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-orange-400 transition-colors">
                                            <FiImage size={24} className="text-gray-400" />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="text-center py-4">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Link to Existing Content</h3>
                                <p className="text-gray-600">Optionally connect this post to your listing or group</p>
                            </div>

                            {/* Link Listing */}
                            {myListings.length > 0 && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Link a Listing</label>
                                    <select
                                        value={formData.linkedListing}
                                        onChange={e => setFormData({ ...formData, linkedListing: e.target.value })}
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all"
                                    >
                                        <option value="">None</option>
                                        {myListings.map(listing => (
                                            <option key={listing._id} value={listing._id}>
                                                {listing.title} - ${listing.price}/mo
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Link Group */}
                            {myGroup && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Link Your Group</label>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({
                                            ...formData,
                                            linkedGroup: formData.linkedGroup ? '' : myGroup._id
                                        })}
                                        className={`w-full p-4 rounded-xl border-2 transition-all text-left ${formData.linkedGroup ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-gray-900">{myGroup.name}</p>
                                                <p className="text-sm text-gray-600">{myGroup.members?.length || 1} members</p>
                                            </div>
                                            {formData.linkedGroup && <FiCheck size={20} className="text-blue-500" />}
                                        </div>
                                    </button>
                                </div>
                            )}

                            {/* Preview */}
                            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                                <h4 className="font-bold text-gray-900 mb-3">Preview</h4>
                                <div className="space-y-2 text-sm">
                                    <p><strong>Channel:</strong> {channels.find(c => c.id === formData.channel)?.label}</p>
                                    <p><strong>Intent:</strong> {allIntents[formData.intent]?.label}</p>
                                    <p><strong>Title:</strong> {formData.title}</p>
                                    <p><strong>Description:</strong> {formData.description.slice(0, 100)}...</p>
                                    {formData.price && <p><strong>Price:</strong> ${formData.price}</p>}
                                    {formData.location && <p><strong>Location:</strong> {formData.location}</p>}
                                    {formData.tags.length > 0 && <p><strong>Tags:</strong> {formData.tags.join(', ')}</p>}
                                    {images.length > 0 && <p><strong>Images:</strong> {images.length} attached</p>}
                                </div>
                            </div>

                            {errors.submit && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                                    {errors.submit}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50">
                    {step > 1 ? (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="flex items-center gap-2 px-5 py-3 text-gray-600 font-bold hover:text-gray-900 transition-colors"
                        >
                            <FiArrowLeft size={18} />
                            Back
                        </button>
                    ) : (
                        <div />
                    )}

                    {step < 3 ? (
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
                        >
                            Next
                            <FiArrowRight size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50"
                        >
                            {loading ? (isEditing ? 'Saving...' : 'Posting...') : (isEditing ? 'Save Changes' : 'Create Post')}
                            <FiCheck size={18} />
                        </button>
                    )}
                </div>
            </div>
        </div >
    );
};

export default CreatePostModal;
