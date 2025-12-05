import React from 'react';
import { FiEdit, FiEye, FiCheckCircle, FiAlertCircle, FiShield } from 'react-icons/fi';

const ProfileHeader = ({ user, completionPercentage = 0, onEdit, onPreview }) => {
    const getInitials = (first, last) => {
        return `${first?.charAt(0) || ''}${last?.charAt(0) || ''}`.toUpperCase();
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 md:p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Avatar Section */}
                <div className="relative shrink-0">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg ring-4 ring-white">
                        {user.profileImage ? (
                            <img src={user.profileImage} alt="Profile" className="w-full h-full rounded-full object-cover" />
                        ) : (
                            getInitials(user.firstName, user.lastName)
                        )}
                    </div>
                    {user.isVerified && (
                        <div className="absolute bottom-1 right-1 bg-white rounded-full p-1.5 shadow-md">
                            <FiCheckCircle className="text-green-500 text-2xl" />
                        </div>
                    )}
                </div>

                {/* Info Section */}
                <div className="flex-1 w-full pt-2">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                                    {user.firstName} {user.lastName}
                                </h1>
                                {user.isVerified && (
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-md text-xs font-bold uppercase tracking-wider border border-green-200">
                                        Verified
                                    </span>
                                )}
                            </div>
                            <p className="text-lg text-gray-500 font-medium">{user.school || 'University Student'}</p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={onPreview}
                                className="px-5 py-2.5 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl font-bold flex items-center gap-2 transition-colors border border-gray-200"
                            >
                                <FiEye size={18} /> Preview
                            </button>
                            <button
                                onClick={onEdit}
                                className="px-5 py-2.5 text-white bg-black hover:bg-gray-800 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                            >
                                <FiEdit size={18} /> Edit Profile
                            </button>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="max-w-xl">
                        <div className="flex items-center justify-between text-sm mb-2">
                            <span className="font-bold text-gray-400 uppercase tracking-wider text-xs">Profile Completion</span>
                            <span className="text-orange-600 font-black">{completionPercentage}%</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-orange-500 to-pink-500 transition-all duration-1000 ease-out rounded-full"
                                style={{ width: `${completionPercentage}%` }}
                            />
                        </div>
                        <p className="text-sm text-gray-500 mt-2 font-medium">
                            {completionPercentage < 100
                                ? "Complete your profile to unlock better matches."
                                : "Your profile is looking great!"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;
