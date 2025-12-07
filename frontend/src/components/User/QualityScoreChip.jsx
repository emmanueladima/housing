import React from 'react';
import { FiStar } from 'react-icons/fi';

const QualityScoreChip = ({ score, size = 'sm', showLabel = true }) => {
  if (score === null || score === undefined) return null;

  // Determine color based on score
  const getScoreColor = () => {
    if (score >= 80) return 'bg-teal-100 text-teal-700 border-teal-300';
    if (score >= 60) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    if (score >= 40) return 'bg-orange-100 text-orange-700 border-orange-300';
    return 'bg-red-100 text-red-700 border-red-300';
  };

  const getScoreLabel = () => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const sizeClasses = {
    xs: 'text-xs px-1.5 py-0.5',
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const iconSizes = {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${getScoreColor()} ${sizeClasses[size]}`}
      title={`Quality Score: ${score}/100 - ${getScoreLabel()}`}
    >
      <FiStar size={iconSizes[size]} />
      <span>{score}</span>
      {showLabel && size !== 'xs' && (
        <span className="hidden sm:inline">Quality</span>
      )}
    </div>
  );
};

export default QualityScoreChip;




