import { Link, useNavigate } from 'react-router-dom';
import { FiMapPin, FiHeart } from 'react-icons/fi';
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

    const primaryImage = listing.images && listing.images[0]
        ? listing.images[0]
        : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800';

    // Get top 3 amenities to display
    const displayAmenities = listing.amenities?.slice(0, 3) || [];

    return (
        <Link
            to={`/listings/${listing._id}`}
            className="group bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-200 block"
        >
            {/* Vertical Layout for Narrow Sidebar */}
            <div className="flex flex-col">
                {/* Image Section - Top */}
                <div className="relative h-40 bg-gray-100 flex-shrink-0">
                    <img
                        src={primaryImage}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800';
                        }}
                    />

                    {/* Favorite Button */}
                    <button
                        onClick={handleFavoriteClick}
                        disabled={favoriteLoading}
                        className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all ${isFavorite
                            ? 'bg-orange-600 text-white'
                            : 'bg-white/90 text-gray-600 hover:bg-orange-600 hover:text-white'
                            } shadow-md`}
                        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                        <FiHeart
                            className={`${isFavorite ? 'fill-current' : ''}`}
                            size={12}
                        />
                    </button>

                    {/* Badges */}
                    {listing.badges && listing.badges.length > 0 && (
                        <div className="absolute bottom-2 left-2">
                            <span className="inline-block px-1.5 py-0.5 bg-orange-600 text-white text-xs font-semibold rounded">
                                {listing.badges[0].toUpperCase()}
                            </span>
                        </div>
                    )}
                </div>

                {/* Details Section - Bottom */}
                <div className="p-2.5">
                    {/* Price */}
                    <div className="flex items-baseline gap-1.5 mb-1">
                        <span className="text-xl font-bold text-gray-900">
                            {formatPrice(listing.rent)}
                        </span>
                        <span className="text-xs text-gray-500">/mo</span>
                    </div>

                    {/* Bed/Bath/Sqft */}
                    <div className="text-xs text-gray-700 mb-1.5 font-medium">
                        {listing.bedrooms === 0 ? 'Studio' : `${listing.bedrooms} bd`} · {listing.bathrooms} ba
                        {listing.sqft && ` · ${listing.sqft.toLocaleString()} sqft`}
                    </div>

                    {/* Address */}
                    <div className="text-xs text-gray-700 mb-0.5 line-clamp-1">
                        {listing.location?.address || listing.address}
                    </div>

                    {/* City, State */}
                    <div className="text-xs text-gray-600 mb-2 line-clamp-1">
                        {listing.location?.city || listing.city}, {listing.location?.state || listing.state}
                    </div>

                    {/* Amenities Bubbles */}
                    {displayAmenities.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                            {displayAmenities.map((amenity, index) => (
                                <span
                                    key={index}
                                    className="inline-block px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200 capitalize"
                                >
                                    {amenity.replace(/-/g, ' ')}
                                </span>
                            ))}
                            {listing.amenities && listing.amenities.length > 3 && (
                                <span className="inline-block px-1.5 py-0.5 text-gray-500 text-xs">
                                    +{listing.amenities.length - 3}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Bottom Section */}
                    <div className="flex items-center justify-between pt-1.5 border-t border-gray-100">
                        {/* Landlord/Agent */}
                        {listing.landlord && (
                            <div className="text-xs text-gray-600 truncate">
                                {listing.landlord.firstName} {listing.landlord.lastName}
                                {listing.landlord.isVerifiedLandlord && (
                                    <span className="ml-1 text-orange-600 font-semibold">✓</span>
                                )}
                            </div>
                        )}

                        {/* Special Tags */}
                        {listing.isSublease && (
                            <span className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded font-medium flex-shrink-0">
                                Sublease
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default CompactListingCard;
