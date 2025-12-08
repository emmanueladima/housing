import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFeatureFlags } from '../contexts/FeatureFlagContext';
import ProfileCreationWizard from '../components/Profile/ProfileCreationWizard';
import lifestyleProfileService from '../services/lifestyleProfileService';
import api from '../services/api';
import { FiEdit3, FiCheckCircle, FiDollarSign, FiCalendar, FiSun, FiMoon, FiVolume2, FiShield, FiMail, FiMapPin, FiZap } from 'react-icons/fi';
import ModernBackground from '../components/shared/ModernBackground';
import LoadingSpinner from '../components/shared/LoadingSpinner';

const Profile = () => {
  const { user } = useAuth();
  const { flags } = useFeatureFlags();
  const [showWizard, setShowWizard] = useState(false);
  const [lifestyleProfile, setLifestyleProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [boosting, setBoosting] = useState(false);

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

  const calculateCompletion = () => {
    let score = 0;
    let total = 0;

    // Basic profile fields
    total += 3;
    if (user.profilePhoto || user.avatar) score++;
    if (user.isVerified) score++;
    if (user.bio || lifestyleProfile?.bio) score++;

    if (lifestyleProfile) {
      total += 8;
      if (lifestyleProfile.cleanliness) score++;
      if (lifestyleProfile.noiseLevel) score++;
      if (lifestyleProfile.sleepTime) score++;
      if (lifestyleProfile.budgetMin || lifestyleProfile.budgetMax) score++;
      if (lifestyleProfile.vibeTags && lifestyleProfile.vibeTags.length > 0) score++;
      if (lifestyleProfile.age) score++;
      if (lifestyleProfile.gender) score++;
      if (lifestyleProfile.photo) score++;

      total += 1;
      if (lifestyleProfile.weeklySchedule && lifestyleProfile.weeklySchedule.length > 0) score++;
    }

    return Math.round((score / total) * 100) || 0;
  };

  if (!user) return null;

  const habits = {
    sleep: lifestyleProfile?.sleepTime > "23:00" ? 'Night Owl' : 'Early Bird',
    noise: lifestyleProfile?.noiseLevel <= 2 ? 'Quiet' : 'Moderate',
    cleanliness: lifestyleProfile?.cleanliness >= 4 ? 'Clean' : 'Average'
  };

  const habitColors = {
    sleep: 'bg-amber-100 text-amber-600',
    noise: 'bg-blue-100 text-blue-600',
    cleanliness: 'bg-emerald-100 text-emerald-600'
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header with Orange Gradient & Orbs */}
      <div className="relative overflow-hidden pt-20 sm:pt-32 pb-16 sm:pb-24">
        <ModernBackground />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Card - Horizontal Layout */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Gray Header Band */}
            <div className="bg-gray-100 h-16 sm:h-20 relative">
              {/* Edit Button */}
              <button
                onClick={() => setShowWizard(true)}
                className="absolute top-3 sm:top-4 right-3 sm:right-4 flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-gray-700 rounded-lg sm:rounded-xl font-semibold hover:bg-gray-50 transition-all shadow-md border border-gray-200 text-sm sm:text-base"
              >
                <FiEdit3 size={14} />
                <span className="hidden sm:inline">Edit Profile</span>
                <span className="sm:hidden">Edit</span>
              </button>
            </div>

            {/* Main Content */}
            <div className="px-4 sm:px-6 md:px-8 pb-6 sm:pb-8">
              {/* Photo & Basic Info Row */}
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6 -mt-10 sm:-mt-12 mb-6 sm:mb-8">
                {/* Photo */}
                <div className="relative shrink-0">
                  <img
                    src={user.avatar || user.profileImage || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=ea580c&color=fff&size=128`}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-20 h-20 sm:w-28 sm:h-28 rounded-xl sm:rounded-2xl object-cover border-4 border-white shadow-xl"
                  />
                  {user.isVerified && (
                    <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 bg-green-500 w-5 h-5 sm:w-7 sm:h-7 rounded-md sm:rounded-lg flex items-center justify-center border-2 sm:border-3 border-white shadow">
                      <FiCheckCircle className="text-white" size={12} />
                    </div>
                  )}
                </div>

                {/* Name & Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 truncate">{user.firstName} {user.lastName}</h1>
                    {lifestyleProfile?.age && (
                      <span className="text-lg sm:text-xl text-gray-500 font-medium">, {lifestyleProfile.age}</span>
                    )}

                    {/* Role Chip */}
                    {user.role === 'landlord' ? (
                      <span className="flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold border border-purple-200">
                        🏢 Landlord
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold border border-orange-200">
                        🎓 Student
                      </span>
                    )}

                    {user.isVerified && (
                      <span className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100">
                        <FiShield size={12} />
                        Verified
                      </span>
                    )}
                  </div>

                  {/* Landlord Info */}
                  {user.role === 'landlord' && user.landlordProfile && (
                    <div className="mb-2 text-gray-600 font-medium flex items-center gap-2">
                      <span>{user.landlordProfile.companyName}</span>
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <span>{user.landlordProfile.propertiesCount} Active Listings</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-gray-500 text-sm sm:text-base">
                    {user.role === 'student' && user.major && <span className="font-medium truncate">{user.major}</span>}
                    {lifestyleProfile?.gender && (
                      <span className="capitalize">{lifestyleProfile.gender}</span>
                    )}
                    {user.email && (
                      <span className="flex items-center gap-1 truncate">
                        <FiMail size={12} />
                        <span className="hidden sm:inline">{user.email}</span>
                        <span className="sm:hidden">{user.email.split('@')[0]}...</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Completion Score */}
                <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-50 text-green-700 rounded-lg sm:rounded-xl border border-green-100">
                  <span className="font-black text-lg sm:text-xl">{calculateCompletion()}%</span>
                  <span className="text-xs sm:text-sm font-semibold">Complete</span>
                </div>

                {/* Boost Profile Button - Hidden until payment integration */}
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-1 sm:gap-2 mb-1">
                    <FiDollarSign className="text-emerald-500" size={14} />
                    <p className="text-xs text-gray-500 font-bold uppercase">Budget</p>
                  </div>
                  <p className="text-base sm:text-xl font-bold text-gray-900">
                    ${lifestyleProfile?.budgetMin || 500} - ${lifestyleProfile?.budgetMax || 1200}
                  </p>
                </div>
                <div className="p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-1 sm:gap-2 mb-1">
                    <FiCalendar className="text-blue-500" size={14} />
                    <p className="text-xs text-gray-500 font-bold uppercase">Move-in</p>
                  </div>
                  <p className="text-base sm:text-xl font-bold text-gray-900">
                    {lifestyleProfile?.lookingFor?.moveInDate
                      ? new Date(lifestyleProfile.lookingFor.moveInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : 'Flexible'}
                  </p>
                </div>
                <div className="p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-100 col-span-2">
                  <div className="flex items-center gap-1 sm:gap-2 mb-1">
                    <FiMapPin className="text-orange-500" size={14} />
                    <p className="text-xs text-gray-500 font-bold uppercase">Looking In</p>
                  </div>
                  <p className="text-base sm:text-xl font-bold text-gray-900">
                    {lifestyleProfile?.lookingFor?.location || 'Near Campus'}
                  </p>
                </div>
              </div>

              {/* Lifestyle Section */}
              <div className="p-4 sm:p-6 bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-100 mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 sm:mb-5">Lifestyle</h3>
                <div className="grid grid-cols-3 gap-3 sm:gap-6">
                  <div className="text-center">
                    <div className={`w-10 h-10 sm:w-14 sm:h-14 mx-auto rounded-lg sm:rounded-xl flex items-center justify-center mb-1 sm:mb-2 ${habitColors.sleep}`}>
                      {habits.sleep === 'Night Owl' ? <FiMoon size={18} /> : <FiSun size={18} />}
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-gray-700">{habits.sleep}</p>
                    <p className="text-xs text-gray-400 hidden sm:block">Sleep</p>
                  </div>
                  <div className="text-center">
                    <div className={`w-10 h-10 sm:w-14 sm:h-14 mx-auto rounded-lg sm:rounded-xl flex items-center justify-center mb-1 sm:mb-2 ${habitColors.noise}`}>
                      <FiVolume2 size={18} />
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-gray-700">{habits.noise}</p>
                    <p className="text-xs text-gray-400 hidden sm:block">Noise</p>
                  </div>
                  <div className="text-center">
                    <div className={`w-10 h-10 sm:w-14 sm:h-14 mx-auto rounded-lg sm:rounded-xl flex items-center justify-center mb-1 sm:mb-2 ${habitColors.cleanliness}`}>
                      <FiCheckCircle size={18} />
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-gray-700">{habits.cleanliness}</p>
                    <p className="text-xs text-gray-400 hidden sm:block">Cleanliness</p>
                  </div>
                </div>

                {/* Compatibility Test Button */}
                {(!lifestyleProfile?.compatibilityAnswers || Object.keys(lifestyleProfile.compatibilityAnswers).length === 0) && (
                  <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                    <button
                      onClick={() => window.location.href = '/compatibility-test'}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white text-orange-600 rounded-xl font-bold hover:bg-orange-50 transition-all border-2 border-orange-100 hover:border-orange-200 shadow-sm"
                    >
                      <FiCheckCircle />
                      Take Compatibility Test
                    </button>
                  </div>
                )}
              </div>

              {/* Bio */}
              {(lifestyleProfile?.bio || user.bio) && (
                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">About Me</h3>
                  <p className="text-gray-600 leading-relaxed">{lifestyleProfile?.bio || user.bio}</p>
                </div>
              )}

              {/* Vibe Tags */}
              {lifestyleProfile?.vibeTags && lifestyleProfile.vibeTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {lifestyleProfile.vibeTags.map((tag, i) => (
                    <span key={i} className="px-4 py-2 bg-orange-50 text-orange-700 rounded-xl text-sm font-semibold border border-orange-100">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
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
