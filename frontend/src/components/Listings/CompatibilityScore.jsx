import React from 'react';
import { FiHeart, FiCheck } from 'react-icons/fi';

const CompatibilityScore = ({ score, reasons = [], compact = false }) => {
  if (score === null || score === undefined) return null;

  // Determine color and label based on score
  const getScoreConfig = () => {
    if (score >= 80) return {
      color: 'bg-teal-100 text-teal-700 border-teal-300',
      label: 'Excellent Match',
      emoji: '🎉',
    };
    if (score >= 60) return {
      color: 'bg-blue-100 text-blue-700 border-blue-300',
      label: 'Good Match',
      emoji: '👍',
    };
    if (score >= 40) return {
      color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      label: 'Fair Match',
      emoji: '🤔',
    };
    return {
      color: 'bg-orange-100 text-orange-700 border-orange-300',
      label: 'Low Match',
      emoji: '⚠️',
    };
  };

  const config = getScoreConfig();

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-medium text-sm ${config.color}`}
        title={`Compatibility: ${score}% - ${reasons.join(', ')}`}
      >
        <FiHeart size={14} />
        <span>{score}%</span>
        <span className="hidden sm:inline">{config.label}</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className={`flex items-center justify-between p-4 rounded-lg border-2 ${config.color}`}>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{config.emoji}</span>
          <div>
            <h3 className="font-bold text-lg">{score}%</h3>
            <p className="text-sm font-medium">{config.label}</p>
          </div>
        </div>
        <FiHeart size={32} className="opacity-30" />
      </div>

      {reasons && reasons.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-sm font-semibold text-gray-700">Why it's a match:</p>
          <ul className="space-y-1">
            {reasons.map((reason, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                <FiCheck size={16} className="text-teal-600 flex-shrink-0 mt-0.5" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CompatibilityScore;




