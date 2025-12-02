import React from 'react';
import { FiEdit, FiEye, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const ProfileHeader = ({ user, completionPercentage = 0, onEdit, onPreview, layout = 'horizontal' }) => {
    const getInitials = (first, last) => {
        return `${first?.charAt(0) || ''}${last?.charAt(0) || ''}`.toUpperCase();
    };

    const isVertical = layout === 'vertical';

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className={`flex flex-col ${!isVertical ? 'md:flex-row' : ''} items-start ${!isVertical ? 'md:items-center' : ''} gap-6`}>
                {/* Avatar */}
                <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-3xl font-bold shadow-md">
                        {user.profileImage ? (
                            <img src={user.profileImage} alt="Profile" className="w-full h-full rounded-full object-cover" />
                        ) : (
                            getInitials(user.firstName, user.lastName)
                        )}
                    </div>
                    {user.isVerified && (
                        <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-sm">
                            <FiCheckCircle className="text-green-500 text-xl" />
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 w-full">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {user.firstName} {user.lastName}
                            </h1>
                            <p className="text-gray-600">{user.school}</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={onPreview}
                                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium flex items-center gap-2 transition-colors"
                            >
                                <FiEye /> Preview
                            </button>
                            <button
                                onClick={onEdit}
                                className="px-4 py-2 text-white bg-orange-600 hover:bg-orange-700 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
                            >
                                <FiEdit /> Edit Profile
                            </button>
                        </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium capitalize border border-blue-100">
                            {user.userType?.replace('-', ' ') || 'User'}
                        </span>
                        {user.isVerified ? (
                            <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
                                <FiCheckCircle size={14} /> Verified
                            </span>
                        ) : (
                            <span className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm font-medium flex items-center gap-1">
                                <FiAlertCircle size={14} /> Unverified
                            </span>
                        )}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full max-w-md group relative" title="Complete your profile to find better matches!">
                        <div className="flex items-center justify-between text-sm mb-1">
                            <span className="font-medium text-gray-700">Profile Completion</span>
                            <span className="text-orange-600 font-bold">{completionPercentage}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-orange-500 to-pink-500 transition-all duration-500 ease-out"
                                style={{ width: `${completionPercentage}%` }}
                            />
                        </div>

                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            {completionPercentage < 100 ? "Add schedule & habits to reach 100%" : "Profile Complete!"}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                        </div>

                        <p className="text-xs text-gray-500 mt-1">
                            {completionPercentage < 100
                                ? "Add your weekly schedule to improve roommate matches."
                                : "Great job! Your profile is complete."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;
