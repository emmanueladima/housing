import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardBody, CardFooter } from '@heroui/card';
import { FiMapPin, FiHeart, FiSquare, FiHome, FiMessageCircle, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = listing.images && listing.images.length > 0
    ? listing.images
    : ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'];

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
      const response = await listingService.toggleFavorite(listing._id);
      setIsFavorite(response.isFavorited);
      await refreshUser();
    } catch (error) {
      console.error('Error toggling favorite:', error);
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

  const handlePrevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <Link to={`/listings/${listing._id}`} className="block">
      <Card
        isBlurred
        className="border-none bg-white/70 dark:bg-default-100/50 backdrop-blur-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
        shadow="sm"
      >
        {/* Image Section with Carousel */}
        <div className="relative h-56 overflow-hidden">
          <img
            src={images[currentImageIndex]}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800';
            }}
          />

          {/* Carousel Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-gray-700 hover:bg-white shadow-lg transition-all opacity-0 group-hover:opacity-100"
                aria-label="Previous image"
              >
                <FiChevronLeft size={18} />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-gray-700 hover:bg-white shadow-lg transition-all opacity-0 group-hover:opacity-100"
                aria-label="Next image"
              >
                <FiChevronRight size={18} />
              </button>
            </>
          )}

          {/* Image Indicators */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${index === currentImageIndex
                      ? 'bg-white w-4'
                      : 'bg-white/50'
                    }`}
                />
              ))}
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {listing.isSublease && (
              <Badge variant="primary" className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg">
                Sublease
              </Badge>
            )}
            {listing.landlord?.landlordProfile?.isVerified && (
              <Badge variant="primary" className="bg-gradient-to-r from-gray-700 to-gray-800 text-white shadow-lg">
                Verified Landlord
              </Badge>
            )}
            {listing.createdAt && new Date(listing.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
              <Badge variant="primary" className="bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg">
                New
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <button
              onClick={handleFavoriteClick}
              disabled={favoriteLoading}
              className={`relative z-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${isFavorite
                ? 'bg-red-500 text-white px-4 gap-2'
                : 'w-10 bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-red-500 hover:text-white'
                } shadow-lg`}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <FiHeart className={`${isFavorite ? 'fill-current' : ''}`} size={18} />
              {isFavorite && <span className="text-sm font-bold">Saved!</span>}
            </button>

            {isAuthenticated && user._id !== listing.landlord?._id && (
              <button
                onClick={handleMessageClick}
                disabled={messageLoading}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-blue-600 hover:text-white shadow-lg"
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

        {/* Blurred Content Footer */}
        <CardFooter className="bg-white/60 backdrop-blur-lg border-t border-white/20 flex flex-col items-start p-4">
          {/* Title */}
          <div className="flex items-start justify-between gap-2 w-full mb-1">
            <h3 className="font-bold text-lg text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1 flex-1">
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
          <div className="flex items-center text-gray-600 text-sm mb-2">
            <FiMapPin className="mr-1 flex-shrink-0" size={14} />
            <span className="truncate">
              {listing.location?.city || listing.city}, {listing.location?.state || listing.state}
            </span>
          </div>

          {/* Quality Score and Tags */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {listing.averageRating > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-50 text-yellow-700 border border-yellow-200">
                <svg className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                {listing.averageRating.toFixed(1)}
              </span>
            )}
            {isEnabled('listingQualityScore') && listing.qualityScore > 0 && (
              <QualityScoreChip score={listing.qualityScore} size="sm" showLabel={false} />
            )}
          </div>

          {/* Price and Details */}
          <div className="flex items-center justify-between w-full pt-2 border-t border-gray-100/50">
            <div>
              <div className="text-2xl font-black text-gray-900">
                {formatPrice(listing.rent)}
              </div>
              <div className="text-xs text-gray-500">per month</div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-3 text-gray-600">
                <div className="flex items-center gap-1">
                  {listing.bedrooms === 0 ? (
                    <>
                      <FiHome size={14} />
                      <span className="text-sm font-medium">Studio</span>
                    </>
                  ) : (
                    <>
                      <FiSquare size={14} />
                      <span className="text-sm font-medium">{listing.bedrooms} bed</span>
                    </>
                  )}
                </div>
                <div className="text-sm font-medium">
                  {listing.bathrooms} bath
                </div>
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ListingCard;
