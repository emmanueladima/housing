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

    total += 3;
    if (user.profileImage || user.avatar) score++;
    if (user.isVerified) score++;
    if (user.bio || (lifestyleProfile && lifestyleProfile.bio)) score++;

    if (lifestyleProfile) {
      total += 7;
      if (lifestyleProfile.cleanliness) score++;
      if (lifestyleProfile.noiseLevel) score++;
      if (lifestyleProfile.sleepTime) score++;
      if (lifestyleProfile.budgetMin) score++;
      if (lifestyleProfile.vibeTags && lifestyleProfile.vibeTags.length > 0) score++;
      if (lifestyleProfile.age) score++;
      if (lifestyleProfile.gender) score++;

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
      <div className="relative overflow-hidden pt-32 pb-24">
        <ModernBackground />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Card - Horizontal Layout */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Gray Header Band */}
            <div className="bg-gray-100 h-20 relative">
              {/* Edit Button */}
              <button
                onClick={() => setShowWizard(true)}
                className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all shadow-md border border-gray-200"
              >
                <FiEdit3 size={16} />
                Edit Profile
              </button>
            </div>

            {/* Main Content */}
            <div className="px-6 md:px-8 pb-8">
              {/* Photo & Basic Info Row */}
              <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-12 mb-8">
                {/* Photo */}
                <div className="relative shrink-0">
                  <img
                    src={user.avatar || user.profileImage || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=ea580c&color=fff&size=128`}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-28 h-28 rounded-2xl object-cover border-4 border-white shadow-xl"
                  />
                  {user.isVerified && (
                    <div className="absolute -bottom-2 -right-2 bg-green-500 w-7 h-7 rounded-lg flex items-center justify-center border-3 border-white shadow">
                      <FiCheckCircle className="text-white" size={14} />
                    </div>
                  )}
                </div>

                {/* Name & Info */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <h1 className="text-3xl font-black text-gray-900">{user.firstName} {user.lastName}</h1>
                    {lifestyleProfile?.age && (
                      <span className="text-xl text-gray-500 font-medium">, {lifestyleProfile.age}</span>
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

                  <div className="flex flex-wrap items-center gap-4 text-gray-500">
                    {user.role === 'student' && user.major && <span className="font-medium">{user.major}</span>}
                    {lifestyleProfile?.gender && (
                      <span className="capitalize">{lifestyleProfile.gender}</span>
                    )}
                    {user.email && (
                      <span className="flex items-center gap-1">
                        <FiMail size={14} />
                        {user.email}
                      </span>
                    )}
                  </div>
                </div>

                {/* Completion Score */}
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl border border-green-100">
                  <span className="font-black text-xl">{calculateCompletion()}%</span>
                  <span className="text-sm font-semibold">Complete</span>
                </div>

                {/* Boost Profile Button - Hidden until payment integration */}
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <FiDollarSign className="text-emerald-500" size={16} />
                    <p className="text-xs text-gray-500 font-bold uppercase">Budget</p>
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    ${lifestyleProfile?.budgetMin || 500} - ${lifestyleProfile?.budgetMax || 1200}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <FiCalendar className="text-blue-500" size={16} />
                    <p className="text-xs text-gray-500 font-bold uppercase">Move-in</p>
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {lifestyleProfile?.lookingFor?.moveInDate
                      ? new Date(lifestyleProfile.lookingFor.moveInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : 'Flexible'}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 md:col-span-2">
                  <div className="flex items-center gap-2 mb-1">
                    <FiMapPin className="text-orange-500" size={16} />
                    <p className="text-xs text-gray-500 font-bold uppercase">Looking In</p>
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {lifestyleProfile?.lookingFor?.location || 'Near Campus'}
                  </p>
                </div>
              </div>

              {/* Lifestyle Section */}
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-5">Lifestyle</h3>
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className={`w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-2 ${habitColors.sleep}`}>
                      {habits.sleep === 'Night Owl' ? <FiMoon size={22} /> : <FiSun size={22} />}
                    </div>
                    <p className="text-sm font-bold text-gray-700">{habits.sleep}</p>
                    <p className="text-xs text-gray-400">Sleep</p>
                  </div>
                  <div className="text-center">
                    <div className={`w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-2 ${habitColors.noise}`}>
                      <FiVolume2 size={22} />
                    </div>
                    <p className="text-sm font-bold text-gray-700">{habits.noise}</p>
                    <p className="text-xs text-gray-400">Noise</p>
                  </div>
                  <div className="text-center">
                    <div className={`w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-2 ${habitColors.cleanliness}`}>
                      <FiCheckCircle size={22} />
                    </div>
                    <p className="text-sm font-bold text-gray-700">{habits.cleanliness}</p>
                    <p className="text-xs text-gray-400">Cleanliness</p>
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
