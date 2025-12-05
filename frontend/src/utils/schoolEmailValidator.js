/**
 * Validate if email is a .edu email address
 */
export const isValidEduEmail = (email) => {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;
  
  return email.toLowerCase().endsWith('.edu');
};

/**
 * Extract school name from .edu email
 */
export const extractSchoolFromEmail = (email) => {
  if (!isValidEduEmail(email)) return '';
  
  try {
    const domain = email.split('@')[1];
    const schoolPart = domain.split('.')[0];
    
    // Capitalize first letter of each word
    return schoolPart
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  } catch (error) {
    return '';
  }
};

/**
 * Common .edu domains for validation
 */
export const commonEduDomains = [
  'harvard.edu',
  'stanford.edu',
  'mit.edu',
  'yale.edu',
  'princeton.edu',
  'columbia.edu',
  'upenn.edu',
  'cornell.edu',
  'dartmouth.edu',
  'brown.edu',
  'berkeley.edu',
  'ucla.edu',
  'usc.edu',
  'umich.edu',
  'unc.edu',
  // Add more as needed
];

