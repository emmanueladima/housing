import { Link, useNavigate } from 'react-router-dom';
import { FiMapPin, FiHeart, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Card, CardBody, CardFooter } from '@heroui/card';
import { formatPrice } from '../../utils/priceFormatter';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react';
import listingService from '../../services/listingService';

const CompactListingCard = ({ listing, onClick }) => {
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

    const handleCardClick = (e) => {
        if (onClick) {
            e.preventDefault();
            onClick(listing);
        }
    };

    return (
        <Link to={`/listings/${listing._id}`} onClick={handleCardClick} className="block h-full">
            <Card
                isBlurred
                isFooterBlurred
                className="w-full h-full col-span-12 sm:col-span-5 border-none overflow-clip group rounded-3xl isolate transform-gpu"
            >
                {/* Full-size background image */}
                <div className="absolute inset-0 overflow-clip rounded-3xl">
                    <img
                        src={currentImage}
                        alt={listing.title}
                        className="w-full h-full object-cover transition-all duration-500 group-hover:brightness-110 group-hover:contrast-105"
                        onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800';
                        }}
                    />
                    {/* Gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent rounded-3xl" />
                </div>

                {/* Navigation Arrows - Show on hover */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={handlePrevImage}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-all opacity-0 group-hover:opacity-100 z-20"
                        >
                            <FiChevronLeft size={20} />
                        </button>
                        <button
                            onClick={handleNextImage}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-all opacity-0 group-hover:opacity-100 z-20"
                        >
                            <FiChevronRight size={20} />
                        </button>

                        {/* Dots Indicator */}
                        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                            {images.slice(0, 5).map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white w-5' : 'bg-white/50'}`}
                                />
                            ))}
                        </div>
                    </>
                )}

                {/* Favorite Button */}
                <button
                    onClick={handleFavoriteClick}
                    disabled={favoriteLoading}
                    className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all z-20 ${isFavorite
                        ? 'bg-orange-500 text-white'
                        : 'bg-white/20 backdrop-blur-md text-white hover:bg-white/40'
                        }`}
                    aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                    <FiHeart
                        className={`${isFavorite ? 'fill-current' : ''}`}
                        size={18}
                    />
                </button>

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-20">
                    {listing.isSublease && (
                        <span className="px-3 py-1 bg-orange-500/80 backdrop-blur-md text-white text-xs font-bold rounded-full">
                            Sublease
                        </span>
                    )}
                    {listing.landlord?.landlordProfile?.isVerified && (
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-full">
                            ✓ Verified
                        </span>
                    )}
                    {listing.createdAt && new Date(listing.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
                        <span className="px-3 py-1 bg-teal-500/80 backdrop-blur-md text-white text-xs font-bold rounded-full">
                            New
                        </span>
                    )}
                </div>

                {/* Frosted Glass Footer */}
                <CardFooter className="absolute bottom-0 left-0 right-0 bg-white/10 backdrop-blur-xl border-t border-white/20 px-4 py-4 z-10">
                    <div className="w-full">
                        {/* Title */}
                        <h3 className="font-bold text-white text-lg truncate group-hover:text-orange-500 transition-colors">
                            {listing.title}
                        </h3>

                        {/* Location */}
                        <div className="flex items-center text-white/80 text-sm mt-1">
                            <FiMapPin className="mr-1" size={14} />
                            <span className="truncate">{listing.city}, {listing.state}</span>
                        </div>

                        {/* Stats & Price Row */}
                        <div className="flex items-center justify-between mt-3">
                            <div className="text-white/60 text-sm">
                                {listing.bedrooms === 0 ? 'Studio' : `${listing.bedrooms} Bed`} • {listing.bathrooms} Bath
                                {listing.sqft && ` • ${listing.sqft.toLocaleString()} sqft`}
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-white">
                                    {formatPrice(listing.rent)}
                                </span>
                                <span className="text-white/60 text-sm">/mo</span>
                            </div>
                        </div>
                    </div>
                </CardFooter>

                {/* Card needs minimum height for the design to work */}
                <div className="h-80" />
            </Card>
        </Link>
    );
};

export default CompactListingCard;
