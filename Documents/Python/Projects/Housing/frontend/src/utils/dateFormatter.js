/**
 * Format date to readable string
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format date to short string
 */
export const formatDateShort = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const d = new Date(date);
  const diffInSeconds = Math.floor((now - d) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} ${diffInWeeks === 1 ? 'week' : 'weeks'} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
};

/**
 * Format time (e.g., "3:45 PM")
 */
export const formatTime = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Format date and time
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  
  return `${formatDate(date)} at ${formatTime(date)}`;
};

/**
 * Check if date is in the past
 */
export const isPast = (date) => {
  if (!date) return false;
  return new Date(date) < new Date();
};

/**
 * Check if date is in the future
 */
export const isFuture = (date) => {
  if (!date) return false;
  return new Date(date) > new Date();
};

/**
 * Get days until date
 */
export const daysUntil = (date) => {
  if (!date) return 0;
  
  const now = new Date();
  const d = new Date(date);
  const diffTime = d - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

