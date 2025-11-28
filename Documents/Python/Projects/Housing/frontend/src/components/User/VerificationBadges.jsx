import React from 'react';
import { FiMail, FiShield, FiCheckCircle } from 'react-icons/fi';

const VerificationBadges = ({ badges = [], size = 'sm', showTooltip = true }) => {
  if (!badges || badges.length === 0) return null;

  const badgeConfig = {
    email: {
      icon: FiMail,
      label: 'Email Verified',
      color: 'text-blue-600 bg-blue-100',
    },
    student: {
      icon: FiShield,
      label: '.edu Verified',
      color: 'text-green-600 bg-green-100',
    },
    id: {
      icon: FiCheckCircle,
      label: 'ID Verified',
      color: 'text-purple-600 bg-purple-100',
    },
  };

  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className="flex items-center gap-1">
      {badges.map((badge) => {
        const config = badgeConfig[badge];
        if (!config) return null;

        const Icon = config.icon;

        return (
          <div
            key={badge}
            className={`${config.color} rounded-full p-1 ${showTooltip ? 'group relative' : ''}`}
            title={config.label}
          >
            <Icon className={sizeClasses[size]} />
            {showTooltip && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                {config.label}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default VerificationBadges;




