import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFeatureFlags } from '../contexts/FeatureFlagContext';
import Button from '../components/shared/Button';
import LifestyleProfileEditor from '../components/Profile/LifestyleProfileEditor';
import WeeklyScheduleEditor from '../components/Profile/WeeklyScheduleEditor';
import lifestyleProfileService from '../services/lifestyleProfileService';
import { FiEdit, FiHeart, FiCalendar } from 'react-icons/fi';

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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">First Name</label>
              <p className="font-medium">{user.firstName}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Last Name</label>
              <p className="font-medium">{user.lastName}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">School</label>
              <p className="font-medium">{user.school}</p>
            </div>
          </div>
          <Button variant="primary" className="mt-4">Edit Profile</Button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Account Status</h2>
          <div className="space-y-2">
            <p>User Type: <span className="font-medium capitalize">{user.userType}</span></p>
            <p>Email Verified: <span className={`font-medium ${user.isVerified ? 'text-green-600' : 'text-red-600'}`}>
              {user.isVerified ? 'Yes' : 'No'}
            </span></p>
          </div>
        </div>

        {/* Lifestyle Profile Section */}
        {flags.roommateCompatibility && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FiHeart className="text-orange-500" size={24} />
                <h2 className="text-xl font-semibold">Lifestyle Profile</h2>
              </div>
              <button
                onClick={() => setShowEditor(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all"
              >
                <FiEdit />
                {lifestyleProfile ? 'Edit Profile' : 'Create Profile'}
              </button>
            </div>

            {loadingProfile ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent"></div>
              </div>
            ) : lifestyleProfile ? (
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">About Me</h3>
                    <div className="text-sm text-gray-500">
                      {lifestyleProfile.age && `${lifestyleProfile.age} years old`}
                      {lifestyleProfile.age && lifestyleProfile.gender && ' • '}
                      {lifestyleProfile.gender && <span className="capitalize">{lifestyleProfile.gender}</span>}
                    </div>
                  </div>
                  {lifestyleProfile.bio && (
                    <p className="text-gray-600 italic">"{lifestyleProfile.bio}"</p>
                  )}
                </div>

                {/* Interests */}
                {lifestyleProfile.interests && lifestyleProfile.interests.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {lifestyleProfile.interests.map(interest => (
                        <span key={interest} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm capitalize">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <label className="text-sm text-gray-600">Cleanliness</label>
                    <p className="font-medium">{lifestyleProfile.cleanliness}/10</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Noise Tolerance</label>
                    <p className="font-medium">{lifestyleProfile.noiseLevel}/10</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Sleep Schedule</label>
                    <p className="font-medium">{lifestyleProfile.sleepTime} - {lifestyleProfile.wakeTime}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Budget Range</label>
                    <p className="font-medium">${lifestyleProfile.budgetMin} - ${lifestyleProfile.budgetMax}</p>
                  </div>
                  {lifestyleProfile.vibes && lifestyleProfile.vibes.length > 0 && (
                    <div className="col-span-2">
                      <label className="text-sm text-gray-600">Personality Vibes</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {lifestyleProfile.vibes.map(vibe => (
                          <span key={vibe} className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                            {vibe}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No lifestyle profile yet. Create one to find compatible roommates!</p>
              </div>
            )}
          </div>
        )}

        {/* Weekly Schedule Section */}
        {flags.lifeRhythmCalendar && lifestyleProfile && (
          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FiCalendar className="text-orange-500" size={24} />
                <h2 className="text-xl font-semibold">Weekly Schedule</h2>
              </div>
              <button
                onClick={() => setShowScheduleEditor(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all"
              >
                <FiEdit />
                Edit Schedule
              </button>
            </div>

            {lifestyleProfile.weeklySchedule && lifestyleProfile.weeklySchedule.length > 0 ? (
              <div className="space-y-2">
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, dayIndex) => {
                  const dayBlocks = lifestyleProfile.weeklySchedule.filter(block => block.day === dayIndex);
                  if (dayBlocks.length === 0) return null;

                  return (
                    <div key={day} className="border-l-4 border-orange-500 pl-4 py-2">
                      <h3 className="font-semibold text-gray-700 mb-1">{day}</h3>
                      <div className="space-y-1">
                        {dayBlocks.map((block, idx) => (
                          <div key={idx} className="text-sm text-gray-600">
                            {block.startHour.toString().padStart(2, '0')}:00 - {block.endHour.toString().padStart(2, '0')}:00: {block.activity}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No schedule set yet. Add your weekly activities to find roommates with compatible schedules!</p>
              </div>
            )}
          </div>
        )}

        {/* Lifestyle Profile Editor Modal */}
        {showEditor && (
          <LifestyleProfileEditor
            onClose={() => setShowEditor(false)}
            onSaved={(profile) => {
              setLifestyleProfile(profile);
              setShowEditor(false);
            }}
          />
        )}

        {/* Weekly Schedule Editor Modal */}
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

