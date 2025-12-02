import React from 'react';
import { FiUser, FiMail, FiPhone, FiBook, FiCalendar, FiEdit2 } from 'react-icons/fi';

const PersonalInfoCard = ({ user, onEdit }) => {
    const InfoRow = ({ icon: Icon, label, value, verified }) => (
        <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
            <div className="mt-1 p-2 bg-gray-50 rounded-lg text-gray-500">
                <Icon size={16} />
            </div>
            <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-0.5">{label}</p>
                <div className="flex items-center gap-2">
                    <p className="text-gray-900 font-medium">{value}</p>
                    {verified && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                            Verified
                        </span>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-fit">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <FiUser className="text-orange-500" /> Personal Info
                </h2>
                <button
                    onClick={onEdit}
                    className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors"
                >
                    <FiEdit2 size={16} />
                </button>
            </div>

            <div className="p-4">
                <InfoRow
                    icon={FiMail}
                    label="Email"
                    value={user.email}
                    verified={user.isVerified}
                />
                <InfoRow
                    icon={FiPhone}
                    label="Phone"
                    value={user.phone || 'Not provided'}
                />
                <InfoRow
                    icon={FiBook}
                    label="School"
                    value={user.school}
                />
                <InfoRow
                    icon={FiCalendar}
                    label="Graduation Year"
                    value={user.graduationYear}
                />
            </div>
        </div>
    );
};

export default PersonalInfoCard;
