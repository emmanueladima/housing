import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFeatureFlags } from '../contexts/FeatureFlagContext';
import ProfileCreationWizard from '../components/Profile/ProfileCreationWizard';
import WeeklyScheduleEditor from '../components/Profile/WeeklyScheduleEditor';
import lifestyleProfileService from '../services/lifestyleProfileService';
import ProfileHeader from '../components/Profile/ProfileHeader';
import DashboardStats from '../components/Profile/DashboardStats';
import PersonalInfoCard from '../components/Profile/PersonalInfoCard';
import LifestyleCard from '../components/Profile/LifestyleCard';
import ScheduleCard from '../components/Profile/ScheduleCard';

const Profile = () => {
  const { user } = useAuth();
  const { flags } = useFeatureFlags();
  const [showEditor, setShowEditor] = useState(false);
  const [showScheduleEditor, setShowScheduleEditor] = useState(false);
  const [lifestyleProfile, setLifestyleProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (flags.roommateCompatibility) {
      loadLifestyleProfile();
    }
  }, [flags.roommateCompatibility]);

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

  const handleScheduleSave = async (schedule) => {
    try {
      const updatedProfile = await lifestyleProfileService.saveMyProfile({
        ...lifestyleProfile,
        weeklySchedule: schedule,
      });
      setLifestyleProfile(updatedProfile);
      setShowScheduleEditor(false);
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert('Failed to save schedule. Please try again.');
    }
  };

  const calculateCompletion = () => {
    let score = 0;
    let total = 0;

    // Basic User Info
    total += 3;
    if (user.profileImage) score++;
    if (user.isVerified) score++;
    if (user.bio || (lifestyleProfile && lifestyleProfile.bio)) score++;

    // Lifestyle Profile
    if (lifestyleProfile) {
      total += 5;
      if (lifestyleProfile.cleanliness) score++;
      if (lifestyleProfile.noiseLevel) score++;
      if (lifestyleProfile.sleepTime) score++;
      if (lifestyleProfile.budgetMin) score++;
      if (lifestyleProfile.vibeTags && lifestyleProfile.vibeTags.length > 0) score++;

      // Schedule
      total += 1;
      if (lifestyleProfile.weeklySchedule && lifestyleProfile.weeklySchedule.length > 0) score++;
    }

    return Math.round((score / total) * 100) || 0;
  };

  if (!user) return null;



  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900">Welcome back, {user.firstName}!</h1>
          <p className="text-gray-500 mt-1">Here's what's happening with your housing search.</p>
        </div>

        {/* Quick Stats */}
        <DashboardStats />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Profile & Personal Info (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <ProfileHeader
              user={user}
              completionPercentage={calculateCompletion()}
              onEdit={() => setShowEditor(true)}
              onPreview={() => { }}
              layout="vertical"
            />
            <PersonalInfoCard
              user={user}
              onEdit={() => { }}
            />
          </div>

          {/* Right Column: Lifestyle & Schedule (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <LifestyleCard
              profile={lifestyleProfile}
              onEdit={() => setShowEditor(true)}
            />
            <ScheduleCard
              schedule={lifestyleProfile?.weeklySchedule}
              onEdit={() => setShowScheduleEditor(true)}
            />
          </div>
        </div>

        {/* Editors */}
        {showEditor && (
          <ProfileCreationWizard
            onSaved={(savedProfile) => {
              setLifestyleProfile(savedProfile);
              setShowEditor(false);
            }}
            onClose={() => setShowEditor(false)}
          />
        )}

        {showScheduleEditor && (
          <WeeklyScheduleEditor
            initialSchedule={lifestyleProfile?.weeklySchedule || []}
            onSave={handleScheduleSave}
            onClose={() => setShowScheduleEditor(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Profile;

