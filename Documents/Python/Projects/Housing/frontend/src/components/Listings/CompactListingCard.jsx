import { Link, useNavigate } from 'react-router-dom';
import { FiMapPin, FiHeart, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { formatPrice } from '../../utils/priceFormatter';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';

const CompactListingCard = ({ listing }) => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [isFavorite, setIsFavorite] = useState(
        user?.favorites?.includes(listing._id) || false
    );
    const [favoriteLoading, setFavoriteLoading] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const handleFavoriteClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            alert('Please log in to save favorites');
            return;
        }

        setFavoriteLoading(true);
        try {
            // TODO: Implement favorite toggle API call
            setIsFavorite(!isFavorite);
        } catch (error) {
            console.error('Error toggling favorite:', error);
        } finally {
            setFavoriteLoading(false);
        }
    };

    const handlePrevImage = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev === 0 ? (listing.images?.length || 1) - 1 : prev - 1));
    };

    const handleNextImage = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev === (listing.images?.length || 1) - 1 ? 0 : prev + 1));
    };

    const images = listing.images && listing.images.length > 0
        ? listing.images
        : ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'];

    const currentImage = images[currentImageIndex];

    return (
        <Link
            to={`/listings/${listing._id}`}
            className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 block h-full flex flex-col"
        >
            {/* Image Section - Carousel */}
            <div className="relative h-48 bg-gray-100 flex-shrink-0 group/image">
                <img
                    src={currentImage}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800';
                    }}
                />

                {/* Navigation Arrows (Visible on Hover) */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={handlePrevImage}
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/90 rounded-full shadow-md opacity-0 group-hover/image:opacity-100 transition-opacity hover:bg-white text-gray-800"
                        >
                            <FiChevronLeft size={16} />
                        </button>
                        <button
                            onClick={handleNextImage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/90 rounded-full shadow-md opacity-0 group-hover/image:opacity-100 transition-opacity hover:bg-white text-gray-800"
                        >
                            <FiChevronRight size={16} />
                        </button>

                        {/* Dots Indicator */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover/image:opacity-100 transition-opacity">
                            {images.slice(0, 5).map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`w-1.5 h-1.5 rounded-full shadow-sm ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                                />
                            ))}
                        </div>
                    </>
                )}

                {/* Favorite Button */}
                <button
                    onClick={handleFavoriteClick}
                    disabled={favoriteLoading}
                    className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${isFavorite
                        ? 'bg-orange-600 text-white'
                        : 'bg-white text-gray-900 hover:bg-gray-100'
                        } shadow-md`}
                    aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                    <FiHeart
                        className={`${isFavorite ? 'fill-current' : ''}`}
                        size={16}
                    />
                </button>

                {/* Badges */}
                {listing.badges && listing.badges.length > 0 && (
                    <div className="absolute top-3 left-3">
                        <span className="inline-block px-2 py-1 bg-orange-600 text-white text-xs font-bold rounded shadow-sm">
                            {listing.badges[0].toUpperCase()}
                        </span>
                    </div>
                )}
            </div>

            {/* Details Section */}
            <div className="p-3 flex flex-col flex-grow">
                {/* Title & Rating */}
                <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-900 truncate pr-2 text-base">
                        {listing.title}
                    </h3>
                    {listing.rating && (
                        <div className="flex items-center text-xs font-semibold bg-green-50 text-green-700 px-1.5 py-0.5 rounded">
                            ★ {listing.rating}
                        </div>
                    )}
                </div>

                {/* Location */}
                <div className="text-sm text-gray-600 mb-2 truncate">
                    {listing.city}, {listing.state}
                </div>

                {/* Stats */}
                <div className="text-sm text-gray-500 mb-3">
                    {listing.bedrooms === 0 ? 'Studio' : `${listing.bedrooms} Bed`} • {listing.bathrooms} Bath • {listing.sqft?.toLocaleString()} sqft
                </div>

                {/* Price - Bottom */}
                <div className="mt-auto pt-2 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-gray-900">
                            {formatPrice(listing.rent)}
                        </span>
                        <span className="text-xs text-gray-500">/mo</span>
                    </div>

                    {listing.isSublease && (
                        <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded">
                            Sublease
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default CompactListingCard;
