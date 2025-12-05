import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FiMapPin, FiHeart, FiSquare, FiHome, FiMessageCircle } from 'react-icons/fi';
import { formatPrice } from '../../utils/priceFormatter';
import Badge from '../shared/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { useFeatureFlags } from '../../contexts/FeatureFlagContext';
import VerificationBadges from '../User/VerificationBadges';
import QualityScoreChip from '../User/QualityScoreChip';

import { createThread } from '../../services/messageService';
import listingService from '../../services/listingService';

const ListingCard = ({ listing }) => {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const { isEnabled } = useFeatureFlags();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);

  // Update isFavorite when user data changes
  useEffect(() => {
    if (user && user.favorites) {
      const isInFavorites = user.favorites.some(fav =>
        (typeof fav === 'string' ? fav : fav._id || fav) === listing._id
      );
      setIsFavorite(isInFavorites);
    }
  }, [user, listing._id]);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      alert('Please log in to save favorites');
      return;
    }

    setFavoriteLoading(true);
    try {
      console.log('Toggling favorite for listing:', listing._id);
      const response = await listingService.toggleFavorite(listing._id);
      console.log('Toggle favorite response:', response);

      setIsFavorite(response.isFavorited);

      // Refresh user data to persist the change
      await refreshUser();
      console.log('User data refreshed');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert state on error
      setIsFavorite(!isFavorite);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleMessageClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      alert('Please log in to message the landlord');
      return;
    }

    if (user._id === listing.landlord?._id) {
      alert('You cannot message yourself');
      return;
    }

    setMessageLoading(true);
    try {
      const threadData = await createThread({
        type: 'listing',
        listingId: listing._id,
        participantIds: [listing.landlord._id],
      });
      navigate(`/messages?thread=${threadData.thread._id}`);
    } catch (error) {
      console.error('Error creating thread:', error);
      alert('Failed to start conversation');
    } finally {
      setMessageLoading(false);
    }
  };

  const primaryImage = listing.images && listing.images[0]
    ? listing.images[0]
    : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800';

  return (
    <Link
      to={`/listings/${listing._id}`}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-orange-300 hover:shadow-xl transition-all duration-300 block relative"
    >
      {/* Image */}
      <div className="relative h-56 bg-gray-100 overflow-hidden">
        <img
          src={primaryImage}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800';
          }}
        />

        {/* Badges */}
        {listing.badges && listing.badges.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {listing.badges.slice(0, 2).map((badge, index) => (
              <Badge key={index} variant="primary" className="bg-orange-600 text-white shadow-lg">
                {badge}
              </Badge>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            disabled={favoriteLoading}
            className={`relative z-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${isFavorite
              ? 'bg-red-500 text-white px-4 gap-2'
              : 'w-10 bg-white/90 text-gray-600 hover:bg-red-500 hover:text-white'
              } shadow-lg`}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <FiHeart
              className={`${isFavorite ? 'fill-current' : ''}`}
              size={18}
            />
            {isFavorite && <span className="text-sm font-bold">Saved!</span>}
          </button>

          {/* Message Button (Only if not owner) */}
          {isAuthenticated && user._id !== listing.landlord?._id && (
            <button
              onClick={handleMessageClick}
              disabled={messageLoading}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 bg-white/90 text-gray-600 hover:bg-blue-600 hover:text-white shadow-lg"
              aria-label="Message Landlord"
              title="Message Landlord"
            >
              {messageLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              ) : (
                <FiMessageCircle size={18} />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title and Verification */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-xl text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2 flex-1">
            {listing.title}
          </h3>
          {isEnabled('userVerification') && listing.landlord?.verification && (
            <VerificationBadges
              badges={listing.landlord.verificationBadges}
              size="sm"
              showTooltip={true}
            />
          )}
        </div>

        {/* Location */}
        <div className="flex items-center text-gray-600 text-sm mb-3">
          <FiMapPin className="mr-1 flex-shrink-0" size={14} />
          <span className="truncate">
            {listing.location?.city || listing.city}, {listing.location?.state || listing.state}
            {listing.distanceToUniversity && (
              <span className="ml-2 text-gray-500">
                • {listing.distanceToUniversity} mi from campus
              </span>
            )}
          </span>
        </div>

        {/* Quality Score and Campus Indicator */}
        <div className="flex items-center gap-2 mb-3">
          {isEnabled('listingQualityScore') && listing.qualityScore > 0 && (
            <QualityScoreChip score={listing.qualityScore} size="sm" showLabel={false} />
          )}
          {isEnabled('campusOverlay') && listing.isOnCampus && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-300">
              On-Campus Area
            </span>
          )}
          {listing.boost?.active && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-300">
              Boosted
            </span>
          )}
        </div>

        {/* Amenities Preview */}
        {listing.amenities && listing.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {listing.amenities.slice(0, 3).map((amenity, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full capitalize border border-gray-200"
              >
                {amenity.replace(/-/g, ' ')}
              </span>
            ))}
            {listing.amenities.length > 3 && (
              <span className="text-xs px-2 py-1 text-gray-500">
                +{listing.amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Bottom Info */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          {/* Price */}
          <div>
            <div className="text-3xl font-black text-gray-900">
              {formatPrice(listing.rent)}
            </div>
            <div className="text-xs text-gray-500">per month</div>
          </div>

          {/* Bed/Bath */}
          <div className="text-right">
            <div className="flex items-center gap-3 text-gray-600">
              <div className="flex items-center gap-1">
                {listing.bedrooms === 0 ? (
                  <>
                    <FiHome size={16} />
                    <span className="text-sm font-medium">Studio</span>
                  </>
                ) : (
                  <>
                    <FiSquare size={16} />
                    <span className="text-sm font-medium">{listing.bedrooms} bed</span>
                  </>
                )}
              </div>
              <div className="text-sm font-medium">
                {listing.bathrooms} bath
              </div>
            </div>
            {listing.sqft && (
              <div className="text-xs text-gray-500 mt-1">
                {listing.sqft} sq ft
              </div>
            )}
          </div>
        </div>

        {/* Sublease Indicator */}
        {listing.isSublease && (
          <div className="mt-3 text-xs font-medium text-orange-600 flex items-center">
            <span className="w-2 h-2 bg-orange-600 rounded-full mr-2"></span>
            Sublease Available
          </div>
        )}
      </div>
    </Link>
  );
};

export default ListingCard;


