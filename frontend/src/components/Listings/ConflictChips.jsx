import React from 'react';
import { FiAlertTriangle, FiInfo } from 'react-icons/fi';

const ConflictChips = ({ conflicts = [], compact = false }) => {
  if (!conflicts || conflicts.length === 0) return null;

  const severityConfig = {
    high: {
      icon: FiAlertTriangle,
      color: 'bg-red-100 text-red-700 border-red-300',
    },
    medium: {
      icon: FiAlertTriangle,
      color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    },
    low: {
      icon: FiInfo,
      color: 'bg-blue-100 text-blue-700 border-blue-300',
    },
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {conflicts.slice(0, 3).map((conflict, index) => {
          const config = severityConfig[conflict.severity] || severityConfig.medium;
          const Icon = config.icon;

          return (
            <div
              key={index}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${config.color}`}
              title={conflict.message}
            >
              <Icon size={12} />
              <span className="truncate max-w-[100px]">{conflict.message}</span>
            </div>
          );
        })}
        {conflicts.length > 3 && (
          <span className="text-xs text-gray-500">+{conflicts.length - 3} more</span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-1">
        <FiAlertTriangle size={14} />
        Potential Conflicts
      </h4>
      <div className="space-y-1.5">
        {conflicts.map((conflict, index) => {
          const config = severityConfig[conflict.severity] || severityConfig.medium;
          const Icon = config.icon;

          return (
            <div
              key={index}
              className={`flex items-start gap-2 px-3 py-2 rounded-lg border ${config.color}`}
            >
              <Icon size={16} className="flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{conflict.message}</p>
                {conflict.details && (
                  <p className="text-xs mt-0.5 opacity-80">{conflict.details}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConflictChips;




