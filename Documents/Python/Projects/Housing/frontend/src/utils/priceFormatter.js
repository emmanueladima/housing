/**
 * Format number as currency (USD)
 */
export const formatPrice = (price) => {
  if (price === null || price === undefined) return '$0';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

/**
 * Format price range
 */
export const formatPriceRange = (min, max) => {
  if (!min && !max) return 'Any price';
  if (!min) return `Up to ${formatPrice(max)}`;
  if (!max) return `${formatPrice(min)}+`;
  return `${formatPrice(min)} - ${formatPrice(max)}`;
};

/**
 * Format number with commas
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  
  return new Intl.NumberFormat('en-US').format(num);
};

/**
 * Format square footage
 */
export const formatSqft = (sqft) => {
  if (!sqft) return '';
  return `${formatNumber(sqft)} sq ft`;
};

/**
 * Calculate price per square foot
 */
export const pricePerSqft = (price, sqft) => {
  if (!price || !sqft) return null;
  return (price / sqft).toFixed(2);
};

/**
 * Format utilities cost
 */
export const formatUtilities = (utilities) => {
  if (!utilities) return 'Not specified';
  
  const included = [];
  if (utilities.water) included.push('Water');
  if (utilities.electricity) included.push('Electricity');
  if (utilities.gas) included.push('Gas');
  if (utilities.internet) included.push('Internet');
  if (utilities.trash) included.push('Trash');
  
  if (included.length === 0) return 'None included';
  if (included.length === 5) return 'All utilities included';
  return included.join(', ') + ' included';
};

