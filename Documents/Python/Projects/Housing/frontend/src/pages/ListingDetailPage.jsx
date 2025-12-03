import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FiMapPin, FiHeart, FiSquare, FiHome, FiCalendar, FiDollarSign,
  FiCheck, FiX, FiMail, FiPhone, FiArrowLeft, FiShare2
} from 'react-icons/fi';
import listingService from '../services/listingService';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import Badge from '../components/shared/Badge';
import Button from '../components/shared/Button';
import { formatPrice } from '../utils/priceFormatter';
import { useAuth } from '../contexts/AuthContext';
import { useFeatureFlags } from '../contexts/FeatureFlagContext';
import ScheduleOverlap from '../components/Listings/ScheduleOverlap';
import ConflictChips from '../components/Listings/ConflictChips';
import CompatibilityScore from '../components/Listings/CompatibilityScore';
import ChecklistDrawer from '../components/Listings/ChecklistDrawer';
import MiniMap from '../components/Map/MiniMap';

const ListingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { flags } = useFeatureFlags();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const data = await listingService.getListing(id);
        setListing(data);
        setIsFavorite(user?.favorites?.includes(id) || false);
      } catch (error) {
        console.error('Error fetching listing:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id, user]);

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      alert('Please log in to save favorites');
      return;
    }
    // TODO: Implement favorite API call
    setIsFavorite(!isFavorite);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing.title,
          text: `Check out this listing on collegio`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleContact = () => {
    if (!isAuthenticated) {
      alert('Please log in to contact the landlord');
      return;
    }
    navigate(`/messages/${listing.landlord._id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Listing not found</h1>
        <Button onClick={() => navigate('/listings')}>Back to Listings</Button>
      </div>
    );
  }

  const primaryImage = listing.images && listing.images[selectedImage]
    ? listing.images[selectedImage]
    : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors"
            >
              <FiArrowLeft size={20} />
              <span className="font-medium">Back</span>
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Share listing"
              >
                <FiShare2 size={20} />
              </button>
              <button
                onClick={handleFavoriteToggle}
                className={`p-2 rounded-full transition-colors ${isFavorite
                  ? 'bg-orange-100 text-orange-600'
                  : 'hover:bg-gray-100'
                  }`}
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <FiHeart className={isFavorite ? 'fill-current' : ''} size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="relative h-96 bg-gray-100">
                <img
                  src={primaryImage}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800';
                  }}
                />
                {listing.badges && listing.badges.length > 0 && (
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    {listing.badges.map((badge, index) => (
                      <Badge key={index} variant="primary" className="bg-orange-600 text-white shadow-lg">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              {listing.images && listing.images.length > 1 && (
                <div className="grid grid-cols-5 gap-2 p-4">
                  {listing.images.slice(0, 5).map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative h-20 rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === index
                        ? 'border-orange-600'
                        : 'border-transparent hover:border-gray-300'
                        }`}
                    >
                      <img
                        src={image}
                        alt={`View ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title and Basic Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h1 className="text-3xl font-black text-gray-900 mb-4">
                {listing.title}
              </h1>

              <div className="flex items-center text-gray-600 mb-4">
                <FiMapPin className="mr-2" size={18} />
                <span className="text-lg">
                  {listing.address}, {listing.city}, {listing.state} {listing.zipCode}
                </span>
              </div>

              <div className="flex flex-wrap gap-6 py-4 border-y border-gray-200">
                <div className="flex items-center gap-2">
                  {listing.bedrooms === 0 ? (
                    <>
                      <FiHome className="text-orange-600" size={20} />
                      <span className="font-semibold">Studio</span>
                    </>
                  ) : (
                    <>
                      <FiSquare className="text-orange-600" size={20} />
                      <span className="font-semibold">{listing.bedrooms} Bedrooms</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <FiHome className="text-orange-600" size={20} />
                  <span className="font-semibold">{listing.bathrooms} Bathrooms</span>
                </div>
                {listing.sqft && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{listing.sqft} sq ft</span>
                  </div>
                )}
                {listing.distanceToUniversity && (
                  <div className="flex items-center gap-2">
                    <FiMapPin className="text-orange-600" size={18} />
                    <span className="font-semibold">{listing.distanceToUniversity} mi to campus</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>

            {/* Amenities */}
            {listing.amenities && listing.amenities.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {listing.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <FiCheck className="text-green-600 flex-shrink-0" size={18} />
                      <span className="text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Details */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold mb-4">Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Lease Term</span>
                  <span className="font-semibold">{listing.leaseTerm}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Available Date</span>
                  <span className="font-semibold">
                    {new Date(listing.availableDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Pets</span>
                  <span className="font-semibold">
                    {listing.rules?.petsAllowed ? 'Allowed' : 'Not Allowed'}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Smoking</span>
                  <span className="font-semibold">
                    {listing.rules?.smokingAllowed ? 'Allowed' : 'Not Allowed'}
                  </span>
                </div>
              </div>
            </div>

            {/* Location & Map */}
            {listing.coordinates?.lat && listing.coordinates?.lng && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold mb-4">Location</h2>
                <MiniMap
                  coordinates={listing.coordinates}
                  rent={listing.rent}
                  address={`${listing.address}, ${listing.city}, ${listing.state}`}
                />
              </div>
            )}

            {/* Utilities */}
            {listing.utilities && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold mb-4">Utilities</h2>
                <div className="space-y-3">
                  {listing.utilities.included && listing.utilities.included.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-green-600 mb-2">Included</h3>
                      <div className="flex flex-wrap gap-2">
                        {listing.utilities.included.map((utility, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm"
                          >
                            {utility}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {listing.utilities.tenantPays && listing.utilities.tenantPays.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-orange-600 mb-2">Tenant Pays</h3>
                      <div className="flex flex-wrap gap-2">
                        {listing.utilities.tenantPays.map((utility, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-orange-50 text-orange-700 rounded-lg text-sm"
                          >
                            {utility}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Roommate Compatibility */}
            {flags.roommateCompatibility && listing.landlord && isAuthenticated && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold mb-4">Roommate Match</h2>
                <CompatibilityScore
                  hostUserId={listing.landlord._id}
                  listingId={listing._id}
                />
              </div>
            )}

            {/* Schedule Overlap */}
            {flags.lifeRhythmCalendar && listing.landlord && isAuthenticated && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold mb-4">Schedule Compatibility</h2>
                <ScheduleOverlap hostUserId={listing.landlord._id} />
              </div>
            )}

            {/* Conflict Preview */}
            {flags.conflictPreview && listing.landlord && isAuthenticated && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold mb-4">Potential Conflicts</h2>
                <ConflictChips
                  hostUserId={listing.landlord._id}
                  listingId={listing._id}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              {/* Price and Actions */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-orange-200">
                <div className="text-center mb-6">
                  <div className="text-4xl font-black text-gray-900 mb-1">
                    {formatPrice(listing.rent)}
                  </div>
                  <div className="text-gray-600">per month</div>
                </div>

                <div className="space-y-3">
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={handleContact}
                  >
                    <FiMail className="mr-2" size={18} />
                    Contact Landlord
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      if (!isAuthenticated) {
                        alert('Please log in to apply');
                        return;
                      }
                      navigate(`/applications/new?listing=${id}`);
                    }}
                  >
                    Apply Now
                  </Button>

                  {/* Pre-Move Checklist Button */}
                  {flags.preMoveChecklist && isAuthenticated && (
                    <Button
                      variant="outline"
                      className="w-full border-orange-300 text-orange-600 hover:bg-orange-50"
                      onClick={() => setShowChecklist(true)}
                    >
                      <FiCalendar className="mr-2" size={18} />
                      Pre-Move Checklist
                    </Button>
                  )}
                </div>

                {listing.isSublease && listing.subleaseDetails && (
                  <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                    <p className="text-sm font-semibold text-orange-700 mb-1">
                      Sublease Available
                    </p>
                    <p className="text-xs text-orange-600">
                      Original lease ends:{' '}
                      {new Date(listing.subleaseDetails.originalLeaseEnd).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Landlord Info */}
              {listing.landlord && (
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold mb-4">Landlord</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-orange-600">
                        {listing.landlord.firstName?.[0]}{listing.landlord.lastName?.[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {listing.landlord.firstName} {listing.landlord.lastName}
                      </p>
                      {listing.landlord.isVerifiedLandlord && (
                        <p className="text-sm text-green-600 flex items-center gap-1">
                          <FiCheck size={14} />
                          Verified Landlord
                        </p>
                      )}
                    </div>
                  </div>
                  {listing.landlord.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiPhone size={16} />
                      <span>{listing.landlord.phone}</span>
                    </div>
                  )}
                </div>
              )}

              {/* University */}
              {listing.university && (
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold mb-2">University</h3>
                  <p className="text-gray-700">{listing.university}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Similar Listings Section */}
        <div className="mt-12">
          <h2 className="text-3xl font-black mb-6">Similar Listings</h2>
          <p className="text-gray-600">Coming soon...</p>
        </div>
      </div>

      {/* Checklist Drawer */}
      {showChecklist && (
        <ChecklistDrawer
          listingId={id}
          onClose={() => setShowChecklist(false)}
        />
      )}
    </div>
  );
};

export default ListingDetailPage;

