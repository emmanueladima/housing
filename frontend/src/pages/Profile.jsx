import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFeatureFlags } from '../contexts/FeatureFlagContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, CardFooter } from '@heroui/card';
import ProfileCreationWizard from '../components/Profile/ProfileCreationWizard';
import lifestyleProfileService from '../services/lifestyleProfileService';
import api from '../services/api';
import {
  FiEdit3, FiSettings, FiCamera, FiUsers, FiMapPin, FiArrowRight,
  FiCheckCircle, FiHeart, FiMessageCircle, FiDollarSign, FiCalendar,
  FiMoon, FiSun
} from 'react-icons/fi';

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const { flags } = useFeatureFlags();
  const navigate = useNavigate();
  const [showWizard, setShowWizard] = useState(false);
  const [lifestyleProfile, setLifestyleProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef(null);

  useEffect(() => {
    if (flags.roommateCompatibility) {
      loadLifestyleProfile();
    }
  }, [flags.roommateCompatibility, user?._id]);

  const loadLifestyleProfile = async () => {
    try {
      const profile = await lifestyleProfileService.getMyProfile();
      setLifestyleProfile(profile);
    } catch (error) {
      console.error('Error loading lifestyle profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSaveProfile = async (updatedProfile) => {
    setLifestyleProfile(updatedProfile);
    setShowWizard(false);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      await api.put('/auth/profile-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await refreshUser();
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (!user) return null;

  // Get lifestyle labels
  const sleepLabel = lifestyleProfile?.sleepTime > "23:00" ? 'Night Owl' : 'Early Bird';
  const noiseLabel = lifestyleProfile?.noiseLevel <= 3 ? 'Quiet' : lifestyleProfile?.noiseLevel <= 6 ? 'Moderate' : 'Social';
  const cleanLabel = lifestyleProfile?.cleanliness >= 7 ? 'Very Clean' : lifestyleProfile?.cleanliness >= 4 ? 'Average' : 'Relaxed';

  return (
    <div className="min-h-screen relative pb-24">
      {/* Header */}
      <div className="relative pt-32 pb-8">
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Main Profile Card */}
        <Card isBlurred className="w-full border border-white/30 shadow-xl rounded-[3rem] overflow-hidden bg-white/20 backdrop-blur-xl">
          <CardBody className="p-6">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Left Column - Avatar & Basic Info */}
              <div className="flex-shrink-0">
                {/* Profile Photo */}
                <div className="relative group mb-4">
                  <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
                    <img
                      src={user.profilePhoto || user.avatar || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=ea580c&color=fff&size=96`}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => photoInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="absolute inset-0 w-24 h-24 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    {uploadingPhoto ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                    ) : (
                      <FiCamera className="text-white" size={24} />
                    )}
                  </button>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />

                  {/* Edit Icon */}
                  <button
                    onClick={() => setShowWizard(true)}
                    className="absolute -top-1 -right-1 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-orange-600 transition-all"
                  >
                    <FiEdit3 size={14} />
                  </button>
                </div>

                {/* Name & Info */}
                <h1 className="text-xl font-black text-white">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-white/70 text-sm">
                  {lifestyleProfile?.major || (user.role === 'landlord' ? 'Landlord' : 'Student')}
                </p>
                {lifestyleProfile?.lookingFor?.location && (
                  <p className="text-white/60 text-xs flex items-center gap-1 mt-1">
                    <FiMapPin size={12} />
                    {lifestyleProfile.lookingFor.location}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setShowWizard(true)}
                    className="px-4 py-2 bg-white text-gray-900 rounded-full font-bold text-sm hover:bg-gray-100 transition-colors"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={() => navigate('/settings')}
                    className="px-4 py-2 bg-white/10 border-2 border-white/30 text-white rounded-full font-bold text-sm hover:bg-white/20 hover:border-white/50 transition-colors"
                  >
                    Settings
                  </button>
                </div>
              </div>

              {/* Right Column - Vibes & Stats Bubbles */}
              <div className="flex-1 sm:pt-4">
                {/* Vibes Section */}
                <div className="mb-4">
                  <span className="text-white/60 text-xs flex items-center gap-1 mb-2">
                    Vibes <FiHeart size={12} />
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {lifestyleProfile?.vibeTags?.slice(0, 5).map((vibe, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-white/20 border border-white/30 text-white rounded-full text-xs font-medium"
                      >
                        {vibe}
                      </span>
                    ))}
                    {(!lifestyleProfile?.vibeTags || lifestyleProfile.vibeTags.length === 0) && (
                      <>
                        <span className="px-3 py-1.5 bg-white/10 border border-white/20 text-white/80 rounded-full text-xs font-medium">
                          {sleepLabel}
                        </span>
                        <span className="px-3 py-1.5 bg-white/10 border border-white/20 text-white/80 rounded-full text-xs font-medium">
                          {noiseLabel}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Stats Bubbles - Inside Card */}
                <div className="flex flex-wrap gap-3">
                  {/* Budget */}
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full">
                    <FiDollarSign className="text-green-300" size={16} />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-green-300 uppercase leading-none">Budget</span>
                      <span className="text-sm font-bold text-green-100 leading-none mt-0.5">
                        ${lifestyleProfile?.budgetMin || 500}-${lifestyleProfile?.budgetMax || 2000}
                      </span>
                    </div>
                  </div>

                  {/* Move-in */}
                  {/* Move-in */}
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full">
                    <FiCalendar className="text-blue-300" size={16} />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-blue-300 uppercase leading-none">Move-in</span>
                      <span className="text-sm font-bold text-blue-100 leading-none mt-0.5">
                        {lifestyleProfile?.lookingFor?.moveInDate
                          ? new Date(lifestyleProfile.lookingFor.moveInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          : 'Flexible'}
                      </span>
                    </div>
                  </div>

                  {/* Cleanliness */}
                  <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full">
                    <FiCheckCircle className="text-purple-300" size={16} />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-purple-300 uppercase leading-none">Cleanliness</span>
                      <span className="text-sm font-bold text-purple-100 leading-none mt-0.5">{cleanLabel}</span>
                    </div>
                  </div>

                  {/* Noise */}
                  <div className="flex items-center gap-2 px-4 py-2 bg-pink-500/20 border border-pink-500/30 rounded-full">
                    <FiMessageCircle className="text-pink-300" size={16} />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-pink-300 uppercase leading-none">Noise</span>
                      <span className="text-sm font-bold text-pink-100 leading-none mt-0.5">{noiseLabel}</span>
                    </div>
                  </div>

                  {/* Sleep */}
                  <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-full">
                    {lifestyleProfile?.sleepTime > "23:00" ? <FiMoon className="text-amber-300" size={16} /> : <FiSun className="text-amber-300" size={16} />}
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-amber-300 uppercase leading-none">Sleep</span>
                      <span className="text-sm font-bold text-amber-100 leading-none mt-0.5">{sleepLabel}</span>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {(lifestyleProfile?.bio || user.bio) && (
                  <div className="mt-4 p-3 bg-white/10 rounded-xl border border-white/20">
                    <p className="text-white/80 text-sm leading-relaxed line-clamp-3">
                      "{lifestyleProfile?.bio || user.bio}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardBody>

          {/* Action Cards Footer */}
          <CardFooter className="bg-white/10 border-t border-white/20 p-4 rounded-b-[3rem]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
              {/* Find Roommates Card */}
              <button
                onClick={() => navigate('/roommates')}
                className="flex items-center justify-between p-3 bg-white/10 rounded-xl border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all group text-left"
              >
                <div>
                  <h4 className="font-bold text-white text-sm">Find Roommates</h4>
                  <p className="text-xs text-white/60">Browse matches</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:bg-white/30 transition-colors">
                  <FiArrowRight size={16} />
                </div>
              </button>

              {/* Messages Card */}
              <button
                onClick={() => navigate('/messages')}
                className="flex items-center justify-between p-3 bg-white/10 rounded-xl border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all group text-left"
              >
                <div>
                  <h4 className="font-bold text-white text-sm">Messages</h4>
                  <p className="text-xs text-white/60">Chat with others</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:bg-white/30 transition-colors">
                  <FiArrowRight size={16} />
                </div>
              </button>

              {/* Compatibility Test Card */}
              <button
                onClick={() => navigate('/compatibility-test')}
                className="flex items-center justify-between p-3 bg-white/10 rounded-xl border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all group text-left"
              >
                <div>
                  <h4 className="font-bold text-white text-sm">Take Quiz</h4>
                  <p className="text-xs text-white/60">Improve score</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:bg-white/30 transition-colors">
                  <FiArrowRight size={16} />
                </div>
              </button>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Modals */}
      {showWizard && (
        <ProfileCreationWizard
          isOpen={showWizard}
          onClose={() => setShowWizard(false)}
          initialData={lifestyleProfile}
          onSaved={handleSaveProfile}
        />
      )}
    </div>
  );
};

export default Profile;
