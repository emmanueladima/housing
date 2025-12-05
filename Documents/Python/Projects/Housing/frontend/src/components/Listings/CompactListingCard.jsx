import { Link, useNavigate } from 'react-router-dom';
import { FiMapPin, FiHeart, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { formatPrice } from '../../utils/priceFormatter';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react';
import listingService from '../../services/listingService';

const CompactListingCard = ({ listing }) => {
    const { user, isAuthenticated, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [isFavorite, setIsFavorite] = useState(false);
    const [favoriteLoading, setFavoriteLoading] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Sync favorite state with user data
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
            className="group bg-white rounded-2xl overflow-hidden border-2 border-gray-100 hover:border-orange-300 shadow-md hover:shadow-2xl transition-all duration-300 block h-full flex flex-col transform hover:-translate-y-1"
        >
            {/* Image Section - Carousel */}
            <div className="relative h-48 bg-gray-100 flex-shrink-0 group/image overflow-hidden">
                <img
                    src={currentImage}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800';
                    }}
                />

                {/* Gradient overlay for better text contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                {/* Navigation Arrows */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={handlePrevImage}
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/90 rounded-full shadow-lg hover:bg-white text-gray-800 transition-all hover:scale-110 z-10"
                        >
                            <FiChevronLeft size={16} />
                        </button>
                        <button
                            onClick={handleNextImage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/90 rounded-full shadow-lg hover:bg-white text-gray-800 transition-all hover:scale-110 z-10"
                        >
                            <FiChevronRight size={16} />
                        </button>

                        {/* Dots Indicator */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                            {images.slice(0, 5).map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`w-2 h-2 rounded-full shadow-sm transition-all ${idx === currentImageIndex ? 'bg-white scale-110' : 'bg-white/60'}`}
                                />
                            ))}
                        </div>
                    </>
                )}

                {/* Favorite Button */}
                <button
                    onClick={handleFavoriteClick}
                    disabled={favoriteLoading}
                    className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all ${isFavorite
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                        : 'bg-white text-gray-900 hover:bg-gray-100 shadow-lg'
                        } z-10`}
                    aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                    <FiHeart
                        className={`${isFavorite ? 'fill-current' : ''}`}
                        size={16}
                    />
                </button>

                {/* Badges */}
                {listing.badges && listing.badges.length > 0 && (
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1 z-10">
                        {listing.badges.map((badge, index) => (
                            <span key={index} className="inline-block px-2.5 py-1 bg-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
                                {badge.toLowerCase()}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Details Section */}
            <div className="p-4 flex flex-col flex-grow bg-gradient-to-b from-white to-gray-50/50">
                {/* Title & Rating */}
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 truncate pr-2 text-base group-hover:text-orange-600 transition-colors">
                        {listing.title}
                    </h3>
                    {listing.rating && (
                        <div className="flex items-center text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-lg">
                            ★ {listing.rating}
                        </div>
                    )}
                </div>

                {/* Location */}
                <div className="flex items-center text-sm text-gray-500 mb-2">
                    <FiMapPin className="mr-1 text-orange-500" size={14} />
                    <span className="truncate">{listing.city}, {listing.state}</span>
                </div>

                {/* Stats */}
                <div className="text-sm text-gray-500 mb-3">
                    {listing.bedrooms === 0 ? 'Studio' : `${listing.bedrooms} Bed`} • {listing.bathrooms} Bath • {listing.sqft?.toLocaleString()} sqft
                </div>

                {/* Price - Bottom */}
                <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-gray-900">
                            {formatPrice(listing.rent)}
                        </span>
                        <span className="text-xs text-gray-500">/mo</span>
                    </div>

                    {listing.isSublease && (
                        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-100">
                            Sublease
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default CompactListingCard;
