import React, { useState, useEffect, useRef } from 'react';
import { FiUser, FiBell, FiLock, FiLogOut, FiCamera, FiLayout, FiLinkedin, FiInstagram, FiGlobe, FiShield, FiX, FiCheck, FiEdit2, FiUpload, FiPlus } from 'react-icons/fi';
import { Button, Avatar, Spinner } from "@heroui/react";
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import lifestyleProfileService from '../../services/lifestyleProfileService';
import ModernBackground from '../shared/ModernBackground';
import ProfileCreationWizard from './ProfileCreationWizard';

const ProfileEditMockup = () => {
    const { user, logout, refreshUser } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('edit-profile');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(null); // 'personal', 'location', 'bio', 'socials'
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: string }
    const fileInputRef = useRef(null);

    // Lifestyle Profile Data
    const [lifestyleProfile, setLifestyleProfile] = useState(null);
    const [showWizard, setShowWizard] = useState(false);
    const [availableTags, setAvailableTags] = useState([]);
    const [habitOptions, setHabitOptions] = useState(null);

    // Preferences Form Data
    const [preferencesData, setPreferencesData] = useState({
        sleepTime: '23:00', // Default
        cleanliness: 'moderate',
        noiseLevel: 'moderate',
        vibeTags: []
    });

    // Form data from user
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        major: '',
        bio: '',
        location: '',
        instagram: '',
        linkedin: ''
    });

    // Notification preferences
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        marketing: false
    });

    // Password change
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });

    // Load user data on mount
    useEffect(() => {
        const loadData = async () => {
            if (user) {
                // Fetch constants
                try {
                    const constants = await lifestyleProfileService.getConstants();
                    if (constants.success) {
                        setAvailableTags(constants.vibeTags || []);
                        setHabitOptions(constants.habitOptions);
                    }
                } catch (e) {
                    console.error("Failed to load constants", e);
                }

                console.log('📷 ProfileEditMockup - Current user.profilePhoto:', user.profilePhoto);
                setFormData({
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    major: user.major || '',
                    bio: user.bio || '',
                    location: user.location || '',
                    instagram: user.socials?.instagram || '',
                    linkedin: user.socials?.linkedin || ''
                });
                if (user.notificationPreferences) {
                    setNotifications(user.notificationPreferences);
                }

                try {
                    const profile = await lifestyleProfileService.getMyProfile();
                    if (profile) {
                        setLifestyleProfile(profile);
                        setPreferencesData({
                            sleepTime: profile.sleepTime || '23:00',
                            cleanliness: profile.cleanliness > 7 ? 'organized' : profile.cleanliness < 4 ? 'messy' : 'moderate',
                            noiseLevel: profile.noiseLevel > 7 ? 'loud' : profile.noiseLevel < 4 ? 'quiet' : 'moderate',
                            vibeTags: profile.vibeTags || []
                        });
                    } else {
                        // User has no profile, show wizard
                        setShowWizard(true);
                    }
                } catch (err) {
                    console.error("Error loading lifestyle profile:", err);
                    // If 404/error, assumedly no profile -> show wizard? 
                    // Or maybe just let them create one partially.
                    // For now, let's enable wizard if we can't find one.
                    setShowWizard(true);
                }
            }
        };
        loadData();
    }, [user]);

    // Sidebar Navigation Items
    const menuItems = [
        {
            section: 'Profile', items: [
                { id: 'edit-profile', label: 'Edit Profile', icon: FiUser },
                { id: 'preferences', label: 'Preferences', icon: FiLayout },
                { id: 'notifications', label: 'Notifications', icon: FiBell },
            ]
        },
        {
            section: 'Account', items: [
                { id: 'password', label: 'Password', icon: FiLock },
                { id: 'privacy', label: 'Privacy & Security', icon: FiShield },
            ]
        }
    ];

    // Frosted glass card style
    const glassCard = "bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-lg";

    // Handle notification toggle
    const handleNotificationChange = async (key) => {
        const newPrefs = { ...notifications, [key]: !notifications[key] };
        setNotifications(newPrefs);
        try {
            await authService.updateProfile({ notificationPreferences: newPrefs });
            await refreshUser();
        } catch (error) {
            console.error('Error updating notifications:', error);
            setNotifications(notifications); // Revert on error
        }
    };

    // Handle save for different sections
    const handleSave = async (section) => {
        setSaving(true);
        try {
            let updateData = {};
            switch (section) {
                case 'personal':
                    updateData = {
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        phone: formData.phone,
                        major: formData.major
                    };
                    break;
                case 'location':
                    updateData = { location: formData.location };
                    break;
                case 'bio':
                    updateData = { bio: formData.bio };
                    break;
                case 'socials':
                    updateData = {
                        socials: {
                            instagram: formData.instagram,
                            linkedin: formData.linkedin
                        }
                    };
                    break;
                case 'lifestyle': // Habits
                    // Map string values back to numbers for DB if needed?
                    // DB schema: cleanliness (1-10), noiseLevel (1-10), sleepTime (string)
                    // Map: messy=1, moderate=5, organized=10
                    // Map: quiet=1, moderate=5, loud=10
                    const cleanMap = { 'messy': 1, 'moderate': 5, 'organized': 10 };
                    const noiseMap = { 'quiet': 1, 'moderate': 5, 'loud': 10 };

                    updateData = {
                        sleepTime: preferencesData.sleepTime,
                        cleanliness: cleanMap[preferencesData.cleanliness] || 5,
                        noiseLevel: noiseMap[preferencesData.noiseLevel] || 5
                    };

                    // Update via lifestyle service
                    await lifestyleProfileService.updateMyProfile(updateData);
                    await lifestyleProfileService.getMyProfile().then(setLifestyleProfile);
                    setEditMode(null);
                    setSaving(false);
                    return; // Return early as this uses different service

                case 'vibes':
                    updateData = {
                        vibeTags: preferencesData.vibeTags
                    };
                    await lifestyleProfileService.updateMyProfile(updateData);
                    await lifestyleProfileService.getMyProfile().then(setLifestyleProfile);
                    setEditMode(null);
                    setSaving(false);
                    return;
            }
            await authService.updateProfile(updateData);
            await refreshUser();
            setEditMode(null);
        } catch (error) {
            console.error('Error saving:', error);
            alert('Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    // Handle photo upload
    const handlePhotoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image must be less than 5MB');
            return;
        }

        setUploadingPhoto(true);
        try {
            // Use FormData for file upload
            const formData = new FormData();
            formData.append('image', file);

            // Import api directly for FormData upload
            const { default: api } = await import('../../services/api');
            const response = await api.put('/auth/profile-photo', formData, {
                headers: { 'Content-Type': 'multipart/form-type' }
            });

            console.log('📷 Photo upload response:', response.data);
            console.log('📷 New profilePhoto URL:', response.data.user?.profilePhoto);

            // Refresh user data to get updated profilePhoto
            const freshUser = await refreshUser();
            console.log('📷 After refresh, user.profilePhoto:', freshUser?.profilePhoto);

            showToast('success', 'Photo uploaded successfully!');
        } catch (error) {
            console.error('Error uploading photo:', error);
            showToast('error', 'Failed to upload photo');
        } finally {
            setUploadingPhoto(false);
        }
    };

    // Toast helper function
    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    // Handle password change
    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.new !== passwordData.confirm) {
            alert("New passwords don't match");
            return;
        }
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated
            alert('Password updated successfully!');
            setShowPasswordModal(false);
            setPasswordData({ current: '', new: '', confirm: '' });
        } catch (error) {
            alert('Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    // Custom Toggle Switch Component
    const ToggleSwitch = ({ checked, onChange }) => (
        <button
            onClick={onChange}
            className={`relative w-14 h-8 rounded-full transition-colors duration-200 ${checked ? 'bg-orange-500' : 'bg-white/20'
                }`}
        >
            <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-200 ${checked ? 'left-7' : 'left-1'
                }`} />
        </button>
    );

    // Handle preference update (Habits) - Local state update only, Save button triggers API
    const handlePreferenceUpdate = (key, value) => {
        const newData = { ...preferencesData, [key]: value };
        setPreferencesData(newData);
    };

    // Handle Vibe Tag toggle - Local state update only
    const handleVibeTagToggle = (tag) => {
        let newTags = [...preferencesData.vibeTags];
        if (newTags.includes(tag)) {
            newTags = newTags.filter(t => t !== tag);
        } else {
            if (newTags.length >= 5) {
                showToast('error', 'Max 5 vibe tags allowed');
                return;
            }
            newTags.push(tag);
        }
        setPreferencesData(prev => ({ ...prev, vibeTags: newTags }));
    };

    // Calculate profile completion
    const calculateCompletion = () => {
        let completed = 0;
        const checks = [
            { done: true, label: 'Setup account', value: 10 },
            { done: !!user?.profilePhoto, label: 'Upload photo', value: 15 },
            { done: !!formData.firstName && !!formData.lastName, label: 'Personal Info', value: 15 },
            { done: !!formData.bio, label: 'Biography', value: 15 },
            { done: !!lifestyleProfile, label: 'Lifestyle Profile', value: 15 },
            { done: !!formData.phone, label: 'Phone number', value: 10 },
            { done: !!formData.location, label: 'Location', value: 10 },
            { done: !!formData.instagram || !!formData.linkedin, label: 'Social links', value: 10 }
        ];
        checks.forEach(c => { if (c.done) completed += c.value; });
        return { percentage: completed, checks };
    };

    const completion = calculateCompletion();

    const handleWizardSaved = (profile) => {
        setLifestyleProfile(profile);
        setShowWizard(false);
        showToast('success', 'Profile created successfully!');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'edit-profile':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white">Edit Profile</h2>

                        {/* Avatar Upload Section */}
                        <div className={`${glassCard} flex items-center gap-6 p-6`}>
                            <div
                                className="relative group cursor-pointer"
                                onClick={() => !uploadingPhoto && fileInputRef.current?.click()}
                            >
                                {/* Custom Avatar with img tag fallback */}
                                <div className="w-24 h-24 rounded-full ring-2 ring-white/30 overflow-hidden bg-white/10 flex items-center justify-center">
                                    {user?.profilePhoto ? (
                                        <img
                                            src={user.profilePhoto}
                                            alt={`${formData.firstName} ${formData.lastName}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                console.log('❌ Image failed to load:', user.profilePhoto);
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <span
                                        className={`text-white font-bold text-2xl ${user?.profilePhoto ? 'hidden' : 'flex'}`}
                                        style={{ display: user?.profilePhoto ? 'none' : 'flex' }}
                                    >
                                        {formData.firstName?.charAt(0) || ''}{formData.lastName?.charAt(0) || ''}
                                    </span>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handlePhotoUpload}
                                    accept="image/*"
                                    className="hidden"
                                />
                                {/* Hover overlay */}
                                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    {uploadingPhoto ? (
                                        <Spinner size="sm" color="white" />
                                    ) : (
                                        <FiCamera size={20} className="text-white" />
                                    )}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-white">Profile Photo</h3>
                                <p className="text-white/60 text-sm mt-1">Click the photo to change it.<br />JPG or PNG, max 5MB</p>
                            </div>
                        </div>

                        {/* Personal Info Card */}
                        <div className={`${glassCard} p-6 space-y-4`}>
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-white">Personal Info</h3>
                                {editMode === 'personal' ? (
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="light" className="text-white/50" onPress={() => setEditMode(null)}>Cancel</Button>
                                        <Button size="sm" className="bg-orange-600 text-white" isLoading={saving} onPress={() => handleSave('personal')}>Save</Button>
                                    </div>
                                ) : (
                                    <Button size="sm" variant="light" className="text-orange-400 font-bold" onPress={() => setEditMode('personal')}>
                                        <FiEdit2 size={14} className="mr-1" /> Edit
                                    </Button>
                                )}
                            </div>

                            {editMode === 'personal' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        placeholder="First Name"
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-orange-500"
                                    />
                                    <input
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        placeholder="Last Name"
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-orange-500"
                                    />
                                    <input
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="Phone"
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-orange-500"
                                    />
                                    <input
                                        value={formData.major}
                                        onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                                        placeholder="Major"
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-orange-500"
                                    />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs text-white/50 font-medium">Full Name</label>
                                        <p className="text-white font-medium">{formData.firstName} {formData.lastName || '—'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-white/50 font-medium">Email</label>
                                        <p className="text-white font-medium">{formData.email || '—'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-white/50 font-medium">Phone</label>
                                        <p className="text-white font-medium">{formData.phone || '—'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-white/50 font-medium">Major</label>
                                        <p className="text-white font-medium">{formData.major || '—'}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Location Card */}
                        <div className={`${glassCard} p-6 space-y-4`}>
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-white">Location</h3>
                                {editMode === 'location' ? (
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="light" className="text-white/50" onPress={() => setEditMode(null)}>Cancel</Button>
                                        <Button size="sm" className="bg-orange-600 text-white" isLoading={saving} onPress={() => handleSave('location')}>Save</Button>
                                    </div>
                                ) : (
                                    <Button size="sm" variant="light" className="text-orange-400 font-bold" onPress={() => setEditMode('location')}>
                                        <FiEdit2 size={14} className="mr-1" /> Edit
                                    </Button>
                                )}
                            </div>
                            {editMode === 'location' ? (
                                <div className="flex gap-4">
                                    <div className="flex-1 relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50"><FiGlobe /></div>
                                        <input
                                            type="text"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            placeholder="City, State"
                                            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-orange-500/50 rounded-xl text-white focus:outline-none focus:border-orange-500"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <p className="text-white/80">{formData.location || 'Not set'}</p>
                            )}
                        </div>

                        {/* Bio Card */}
                        <div className={`${glassCard} p-6 space-y-4`}>
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-white">Bio</h3>
                                {editMode === 'bio' ? (
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="light" className="text-white/50" onPress={() => setEditMode(null)}>Cancel</Button>
                                        <Button size="sm" className="bg-orange-600 text-white" isLoading={saving} onPress={() => handleSave('bio')}>Save</Button>
                                    </div>
                                ) : (
                                    <Button size="sm" variant="light" className="text-orange-400 font-bold" onPress={() => setEditMode('bio')}>
                                        <FiEdit2 size={14} className="mr-1" /> Edit
                                    </Button>
                                )}
                            </div>
                            {editMode === 'bio' ? (
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    placeholder="Tell us about yourself..."
                                    rows={4}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-orange-500 resize-none"
                                />
                            ) : (
                                <p className="text-white/80 leading-relaxed">{formData.bio || 'No bio yet'}</p>
                            )}
                        </div>

                        {/* Socials Card */}
                        <div className={`${glassCard} p-6 space-y-4`}>
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-white">Socials</h3>
                                {editMode === 'socials' ? (
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="light" className="text-white/50" onPress={() => setEditMode(null)}>Cancel</Button>
                                        <Button size="sm" className="bg-orange-600 text-white" isLoading={saving} onPress={() => handleSave('socials')}>Save</Button>
                                    </div>
                                ) : (
                                    <Button size="sm" variant="light" className="text-orange-400 font-bold" onPress={() => setEditMode('socials')}>
                                        <FiEdit2 size={14} className="mr-1" /> Edit
                                    </Button>
                                )}
                            </div>
                            {editMode === 'socials' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50"><FiInstagram /></div>
                                        <input
                                            value={formData.instagram}
                                            onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                                            placeholder="Instagram username"
                                            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-orange-500"
                                        />
                                    </div>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50"><FiLinkedin /></div>
                                        <input
                                            value={formData.linkedin}
                                            onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                                            placeholder="LinkedIn profile URL"
                                            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-orange-500"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                                        <FiInstagram className="text-white/50" />
                                        <span className="text-white/60 text-sm">{formData.instagram || 'Not set'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                                        <FiLinkedin className="text-white/50" />
                                        <span className="text-white/60 text-sm">{formData.linkedin || 'Not set'}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'preferences':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white">Preferences</h2>
                        <div className={`${glassCard} p-6`}>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-white">Lifestyle Habits</h3>
                                {editMode === 'lifestyle' ? (
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="light" className="text-white/50" onPress={() => setEditMode(null)}>Cancel</Button>
                                        <Button size="sm" className="bg-orange-600 text-white" isLoading={saving} onPress={() => handleSave('lifestyle')}>Save</Button>
                                    </div>
                                ) : (
                                    <Button size="sm" variant="light" className="text-orange-400 font-bold" onPress={() => setEditMode('lifestyle')}>
                                        <FiEdit2 size={14} className="mr-1" /> Edit
                                    </Button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Sleep Habit */}
                                <div className="bg-white/10 rounded-2xl p-4 text-center border border-white/10 space-y-2">
                                    <div className="text-2xl mb-2">{preferencesData.sleepTime > "23:00" ? "🌙" : "🌅"}</div>
                                    <p className="text-white font-bold">{preferencesData.sleepTime > "23:00" ? "Night Owl" : "Early Bird"}</p>
                                    <p className="text-white/50 text-xs uppercase tracking-wider">Sleep Schedule</p>
                                    {editMode === 'lifestyle' && (
                                        <div className="flex justify-center gap-2 mt-2">
                                            <button
                                                onClick={() => handlePreferenceUpdate('sleepTime', '22:00')}
                                                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${preferencesData.sleepTime <= "23:00" ? 'bg-orange-500 text-white' : 'bg-white/10 text-white/50 hover:bg-white/20'}`}
                                            >
                                                Early
                                            </button>
                                            <button
                                                onClick={() => handlePreferenceUpdate('sleepTime', '01:00')}
                                                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${preferencesData.sleepTime > "23:00" ? 'bg-orange-500 text-white' : 'bg-white/10 text-white/50 hover:bg-white/20'}`}
                                            >
                                                Late
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Noise Habit */}
                                <div className="bg-white/10 rounded-2xl p-4 text-center border border-white/10 space-y-2">
                                    <div className="text-2xl mb-2">{preferencesData.noiseLevel === 'quiet' ? "🤫" : preferencesData.noiseLevel === 'loud' ? "🔊" : "🔇"}</div>
                                    <p className="text-white font-bold capitalize">{preferencesData.noiseLevel}</p>
                                    <p className="text-white/50 text-xs uppercase tracking-wider">Noise Level</p>
                                    {editMode === 'lifestyle' && (
                                        <div className="flex justify-center gap-1 mt-2">
                                            {['quiet', 'moderate', 'loud'].map(level => (
                                                <button
                                                    key={level}
                                                    onClick={() => handlePreferenceUpdate('noiseLevel', level)}
                                                    className={`px-2 py-1 rounded-full text-[10px] font-bold transition-all ${preferencesData.noiseLevel === level ? 'bg-orange-500 text-white' : 'bg-white/10 text-white/50 hover:bg-white/20'}`}
                                                >
                                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Cleanliness Habit */}
                                <div className="bg-white/10 rounded-2xl p-4 text-center border border-white/10 space-y-2">
                                    <div className="text-2xl mb-2">{preferencesData.cleanliness === 'messy' ? "🌪️" : preferencesData.cleanliness === 'pristine' ? "✨" : "🧹"}</div>
                                    <p className="text-white font-bold capitalize">{preferencesData.cleanliness}</p>
                                    <p className="text-white/50 text-xs uppercase tracking-wider">Cleanliness</p>
                                    {editMode === 'lifestyle' && (
                                        <div className="flex justify-center gap-1 mt-2">
                                            {['messy', 'moderate', 'organized'].map(level => (
                                                <button
                                                    key={level}
                                                    onClick={() => handlePreferenceUpdate('cleanliness', level)}
                                                    className={`px-2 py-1 rounded-full text-[10px] font-bold transition-all ${preferencesData.cleanliness === level ? 'bg-orange-500 text-white' : 'bg-white/10 text-white/50 hover:bg-white/20'}`}
                                                >
                                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Vibe Tags Section */}
                        <div className={`${glassCard} p-6`}>
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-white">Vibe Tags</h3>
                                    <p className="text-white/50 text-sm">Select up to 5 tags that describe your vibe.</p>
                                </div>
                                {editMode === 'vibes' ? (
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="light" className="text-white/50" onPress={() => setEditMode(null)}>Cancel</Button>
                                        <Button size="sm" className="bg-orange-600 text-white" isLoading={saving} onPress={() => handleSave('vibes')}>Save</Button>
                                    </div>
                                ) : (
                                    <Button size="sm" variant="light" className="text-orange-400 font-bold" onPress={() => setEditMode('vibes')}>
                                        <FiEdit2 size={14} className="mr-1" /> Edit
                                    </Button>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2 mb-6">
                                {preferencesData.vibeTags.map(tag => (
                                    <span key={tag} className="px-4 py-2 rounded-full text-sm font-bold bg-orange-500 text-white border border-orange-400 flex items-center gap-2 animate-in zoom-in-90 duration-200">
                                        {tag}
                                        {editMode === 'vibes' && (
                                            <button onClick={() => handleVibeTagToggle(tag)} className="hover:text-black/50 transition-colors">
                                                <FiX size={14} />
                                            </button>
                                        )}
                                    </span>
                                ))}
                            </div>

                            {editMode === 'vibes' && (
                                <>
                                    <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Available Tags</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {availableTags.filter(tag => !preferencesData.vibeTags.includes(tag)).map(tag => (
                                            <button
                                                key={tag}
                                                onClick={() => handleVibeTagToggle(tag)}
                                                className="px-4 py-2 rounded-full text-sm font-medium bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:border-white/30 hover:text-white transition-all flex items-center gap-2"
                                            >
                                                <FiPlus size={14} />
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                );
            case 'notifications':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white">Notifications</h2>
                        <div className={`${glassCard} p-6 divide-y divide-white/10`}>
                            <div className="flex items-center justify-between py-4 first:pt-0">
                                <div>
                                    <p className="font-bold text-white">Email Notifications</p>
                                    <p className="text-sm text-white/50">Receive updates via email</p>
                                </div>
                                <ToggleSwitch checked={notifications.email} onChange={() => handleNotificationChange('email')} />
                            </div>
                            <div className="flex items-center justify-between py-4">
                                <div>
                                    <p className="font-bold text-white">Push Notifications</p>
                                    <p className="text-sm text-white/50">Receive push notifications</p>
                                </div>
                                <ToggleSwitch checked={notifications.push} onChange={() => handleNotificationChange('push')} />
                            </div>
                            <div className="flex items-center justify-between py-4 last:pb-0">
                                <div>
                                    <p className="font-bold text-white">Marketing Emails</p>
                                    <p className="text-sm text-white/50">Receive marketing updates</p>
                                </div>
                                <ToggleSwitch checked={notifications.marketing} onChange={() => handleNotificationChange('marketing')} />
                            </div>
                        </div>
                    </div>
                );
            case 'password':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white">Change Password</h2>
                        <div className={`${glassCard} p-6`}>
                            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                                <div>
                                    <label className="block text-sm font-bold text-white/70 mb-2">Current Password</label>
                                    <input
                                        type="password"
                                        value={passwordData.current}
                                        onChange={e => setPasswordData({ ...passwordData, current: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-orange-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-white/70 mb-2">New Password</label>
                                    <input
                                        type="password"
                                        value={passwordData.new}
                                        onChange={e => setPasswordData({ ...passwordData, new: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-orange-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-white/70 mb-2">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={passwordData.confirm}
                                        onChange={e => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-orange-500"
                                        required
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    isLoading={loading}
                                    className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl"
                                >
                                    Update Password
                                </Button>
                            </form>
                        </div>
                    </div>
                );
            case 'privacy':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white">Privacy & Security</h2>
                        <div className={`${glassCard} p-6 divide-y divide-white/10`}>
                            <div className="flex items-center justify-between py-4 first:pt-0">
                                <div>
                                    <p className="font-bold text-white">Profile Visibility</p>
                                    <p className="text-sm text-white/50">Allow others to see your profile</p>
                                </div>
                                <ToggleSwitch checked={true} onChange={() => { }} />
                            </div>
                            <div className="flex items-center justify-between py-4">
                                <div>
                                    <p className="font-bold text-white">Show Online Status</p>
                                    <p className="text-sm text-white/50">Let others see when you're online</p>
                                </div>
                                <ToggleSwitch checked={true} onChange={() => { }} />
                            </div>
                            <div className="flex items-center justify-between py-4 last:pb-0">
                                <div>
                                    <p className="font-bold text-white">Two-Factor Authentication</p>
                                    <p className="text-sm text-white/50">Add extra security to your account</p>
                                </div>
                                <Button size="sm" variant="bordered" className="text-orange-400 border-orange-400/50">Enable</Button>
                            </div>
                        </div>
                        <div className={`${glassCard} p-6`}>
                            <h3 className="text-lg font-bold text-red-400 mb-4">Danger Zone</h3>
                            <Button variant="bordered" className="text-red-400 border-red-400/50">Delete Account</Button>
                        </div>
                    </div>
                );
            default:
                return <div className="p-8 text-center text-white/50">Select a tab from the sidebar</div>;
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" color="warning" />
            </div>
        );
    }

    // Calculate stroke dashoffset for progress circle (289 is full circle)
    const strokeDashoffset = 289 - (289 * completion.percentage / 100);

    // All menu items flattened for mobile tabs
    const allMenuItems = menuItems.flatMap(section => section.items);

    return (
        <div className="min-h-screen relative">
            {/* Animated Background */}
            <div className="fixed inset-0 z-0">
                <ModernBackground />
            </div>

            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg backdrop-blur-xl border transition-all animate-fadeIn ${toast.type === 'success'
                    ? 'bg-green-500/20 border-green-500/50 text-green-300'
                    : 'bg-red-500/20 border-red-500/50 text-red-300'
                    }`}>
                    <div className="flex items-center gap-2">
                        {toast.type === 'success' ? <FiCheck size={18} /> : <FiX size={18} />}
                        <span className="font-bold">{toast.message}</span>
                    </div>
                </div>
            )}

            {/* Mobile Layout */}
            <div className="relative z-10 min-h-screen md:hidden">
                {/* Mobile Header with Tabs */}
                <div className="sticky top-0 z-20 bg-black/20 backdrop-blur-xl border-b border-white/10 p-4">
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {allMenuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all focus:outline-none ${activeTab === item.id
                                    ? 'bg-orange-600 text-white'
                                    : 'bg-white/10 text-white/70'
                                    }`}
                            >
                                <item.icon size={16} />
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Mobile Content */}
                <div className="p-4 pb-24">
                    {renderContent()}
                </div>

                {/* Mobile Bottom Bar */}
                <div className="fixed bottom-0 left-0 right-0 bg-black/20 backdrop-blur-xl border-t border-white/10 p-4 z-20">
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 text-red-400 font-bold text-sm py-2"
                    >
                        <FiLogOut size={18} />
                        Log Out
                    </button>
                </div>
            </div>

            {/* Desktop Layout */}
            <div className="relative z-10 min-h-screen py-12 px-4 sm:px-6 lg:px-8 hidden md:flex items-center justify-center">
                {/* Main Container - Frosted Glass Card */}
                <div className="w-full max-w-6xl h-[85vh] bg-black/10 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden flex flex-row">

                    {/* 1. Sidebar Left */}
                    <div className="w-64 bg-white/5 border-r border-white/10 p-6 flex flex-col flex-shrink-0">

                        <nav className="flex-1 space-y-6 overflow-y-auto custom-scrollbar">
                            {menuItems.map((section, idx) => (
                                <div key={idx}>
                                    <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3 px-3">{section.section}</p>
                                    <div className="space-y-1">
                                        {section.items.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => setActiveTab(item.id)}
                                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 focus:outline-none ${activeTab === item.id
                                                    ? 'bg-white/15 text-white shadow-sm border border-white/10'
                                                    : 'text-white/60 hover:bg-white/10 hover:text-white border border-transparent'
                                                    }`}
                                            >
                                                <item.icon size={18} />
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </nav>

                        <div className="mt-6 pt-6 border-t border-white/10">
                            <button
                                onClick={logout}
                                className="flex items-center gap-3 text-red-400 hover:text-red-300 font-bold text-sm transition-colors px-3"
                            >
                                <FiLogOut size={18} />
                                Log Out
                            </button>
                        </div>
                    </div>

                    {/* 2. Main Content Right */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10">
                        <div className="flex gap-8 items-start">
                            <div className="flex-1 min-w-0 transition-opacity duration-200">
                                {renderContent()}
                            </div>

                            {/* Right Widget - Profile Completion */}
                            <div className="hidden xl:block w-72 sticky top-0 flex-shrink-0">
                                <div className={`${glassCard} p-6`}>
                                    <h3 className="font-bold text-white mb-6">Complete your profile</h3>
                                    <div className="flex justify-center mb-6 relative">
                                        <div className="w-28 h-28 rounded-full border-4 border-white/10 flex items-center justify-center relative">
                                            <svg className="w-full h-full -rotate-90 absolute" viewBox="0 0 100 100">
                                                <circle
                                                    cx="50" cy="50" r="46"
                                                    fill="none"
                                                    stroke="#ea580c"
                                                    strokeWidth="8"
                                                    strokeDasharray="289"
                                                    strokeDashoffset={strokeDashoffset}
                                                    strokeLinecap="round"
                                                    className="transition-all duration-500"
                                                />
                                            </svg>
                                            <span className="text-2xl font-black text-white">{completion.percentage}%</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3 text-sm">
                                        {completion.checks.map((check, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${check.done ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/30'
                                                    }`}>
                                                    {check.done ? <FiCheck size={12} /> : '○'}
                                                </div>
                                                <span className={`flex-1 ${check.done ? 'text-white/70' : 'text-white/50'}`}>{check.label}</span>
                                                <span className={check.done ? 'text-white/40' : 'text-orange-400 font-bold'}>
                                                    {check.done ? `${check.value}%` : `+${check.value}%`}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.1); border-radius: 20px; }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            {/* Onboarding Wizard */}
            {showWizard && (
                <ProfileCreationWizard
                    isOpen={showWizard}
                    onClose={() => {
                        // If they close without saving and have no profile, they might be stuck?
                        // But usually the wizard handles its own constraints.
                        setShowWizard(false);
                    }}
                    initialData={lifestyleProfile}
                    onSaved={handleWizardSaved}
                />
            )}
        </div>
    );
};

export default ProfileEditMockup;
