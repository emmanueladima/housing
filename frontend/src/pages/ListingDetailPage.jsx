import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FiMapPin, FiHeart, FiSquare, FiHome, FiCalendar, FiDollarSign,
  FiCheck, FiX, FiMail, FiPhone, FiArrowLeft, FiShare2, FiMoreHorizontal, FiFlag, FiUser,
  FiChevronLeft, FiChevronRight, FiZap, FiEdit, FiEye
} from 'react-icons/fi';
import listingService from '../services/listingService';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import Badge from '../components/shared/Badge';
import Button from '../components/shared/Button';
import { formatPrice } from '../utils/priceFormatter';
import { useAuth } from '../contexts/AuthContext';
import { useFeatureFlags } from '../contexts/FeatureFlagContext';

import ChecklistDrawer from '../components/Listings/ChecklistDrawer';
import MiniMap from '../components/Map/MiniMap';
import ListingCard from '../components/Listings/ListingCard';
import TourRequestModal from '../components/Listings/TourRequestModal';
import QuickApplyModal from '../components/applications/QuickApplyModal';
import ListingReviews from '../components/Listings/ListingReviews';

const ListingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { flags } = useFeatureFlags();
  const [listing, setListing] = useState(null);
  const [similarListings, setSimilarListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showTourModal, setShowTourModal] = useState(false);
  const [showQuickApply, setShowQuickApply] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const data = await listingService.getListing(id);
        setListing(data);
        setIsFavorite(user?.favorites?.includes(id) || false);

        // Fetch similar listings
        const similar = await listingService.getSimilarListings(data);
        setSimilarListings(similar);
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
    try {
      await listingService.toggleFavorite(id);
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
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
    navigate(`/messages?user=${listing.landlord._id}`);
  };

  const handleReport = () => {
    // Placeholder for report functionality
    const reason = prompt("Please provide a reason for reporting this listing:");
    if (reason) {
      alert("Thank you for your report. We will review this listing.");
      setShowMoreMenu(false);
    }
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
      <div className="bg-white border-b relative z-10 pt-16 sm:pt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-orange-600 transition-colors"
            >
              <FiArrowLeft size={20} />
              <span className="font-medium hidden sm:inline">Back</span>
            </button>
            <div className="flex items-center gap-1 sm:gap-3">
              <button
                onClick={handleShare}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-full hover:bg-gray-100 transition-colors font-medium text-gray-700"
              >
                <FiShare2 size={18} />
                <span className="hidden sm:inline">Share</span>
              </button>
              <button
                onClick={handleFavoriteToggle}
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-full transition-colors font-medium ${isFavorite
                  ? 'bg-orange-50 text-orange-600'
                  : 'hover:bg-gray-100 text-gray-700'
                  }`}
              >
                <FiHeart className={isFavorite ? 'fill-current' : ''} size={18} />
                <span className="hidden sm:inline">{isFavorite ? 'Saved' : 'Save'}</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-700"
                >
                  <FiMoreHorizontal size={24} />
                </button>
                {showMoreMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <button
                      onClick={handleReport}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                    >
                      <FiFlag size={16} />
                      Report Listing
                    </button>
                    {listing.landlord && (
                      <button
                        onClick={() => navigate(`/profile/${listing.landlord._id}`)}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                      >
                        <FiUser size={16} />
                        View Landlord
                      </button>
                    )}
                  </div>
                )}
              </div>
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
              <div className="relative h-56 sm:h-72 md:h-96 bg-gray-100 group">
                <img
                  src={primaryImage}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800';
                  }}
                />

                {/* Navigation Arrows */}
                {listing.images && listing.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage(selectedImage === 0 ? listing.images.length - 1 : selectedImage - 1)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 rounded-full shadow-lg hover:bg-white text-gray-800 transition-all hover:scale-110 z-10"
                    >
                      <FiChevronLeft size={24} />
                    </button>
                    <button
                      onClick={() => setSelectedImage(selectedImage === listing.images.length - 1 ? 0 : selectedImage + 1)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 rounded-full shadow-lg hover:bg-white text-gray-800 transition-all hover:scale-110 z-10"
                    >
                      <FiChevronRight size={24} />
                    </button>
                  </>
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
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 mb-2 sm:mb-4">
                {listing.title}
              </h1>

              <div className="flex items-center text-gray-600 mb-3 sm:mb-4">
                <FiMapPin className="mr-2 flex-shrink-0" size={16} />
                <span className="text-sm sm:text-lg truncate">
                  {listing.address}, {listing.city}, {listing.state} {listing.zipCode}
                </span>
              </div>

              <div className="flex flex-wrap gap-3 sm:gap-6 py-3 sm:py-4 border-y border-gray-200 text-sm sm:text-base">
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

              {/* Badges moved below heading */}
              <div className="flex flex-wrap gap-2 mb-4">
                {listing.isSublease && (
                  <Badge variant="primary" className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg">
                    Student Sublet
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

                {/* Owner Controls - Show if current user owns this listing */}
                {user && listing.landlord?._id === user._id ? (
                  <div className="space-y-3">
                    {/* Stats */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 flex items-center gap-1">
                          <FiEye size={14} /> Views
                        </span>
                        <span className="font-bold text-gray-900">{listing.totalViews || 0}</span>
                      </div>
                    </div>

                    {/* Listing Status */}
                    <div className={`w-full py-3 rounded-xl text-center font-bold ${listing.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {listing.isActive ? '✓ Active Listing' : 'Inactive'}
                    </div>

                    {/* Edit Listing */}
                    <Button
                      variant="primary"
                      className="w-full rounded-full"
                      onClick={() => navigate(`/listings/edit/${listing._id}`)}
                    >
                      <FiEdit className="mr-2" size={18} />
                      Edit Listing
                    </Button>

                    {/* Back to Dashboard */}
                    <button
                      onClick={() => navigate('/landlord/dashboard')}
                      className="w-full py-2 text-gray-600 font-medium hover:text-orange-600 transition-colors"
                    >
                      ← Back to Dashboard
                    </button>
                  </div>
                ) : (
                  /* Visitor Controls */
                  <div className="space-y-3">
                    {/* Quick Apply Button */}
                    {isAuthenticated && !hasApplied && (
                      <Button
                        variant="primary"
                        className="w-full rounded-full shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all duration-300"
                        onClick={() => setShowQuickApply(true)}
                      >
                        <FiZap className="mr-2" size={18} />
                        Quick Apply
                      </Button>
                    )}
                    {hasApplied && (
                      <div className="w-full py-3 rounded-full bg-green-100 text-green-700 text-center font-bold">
                        ✓ Application Submitted
                      </div>
                    )}
                    <Button
                      variant={hasApplied ? "primary" : "secondary"}
                      className={`w-full rounded-full ${hasApplied ? 'shadow-lg shadow-orange-200' : 'bg-gray-50 border border-gray-200'} transition-all duration-300`}
                      onClick={handleContact}
                    >
                      <FiMail className="mr-2" size={18} />
                      Contact Landlord
                    </Button>
                    {/* Request Tour Button */}
                    {isAuthenticated && (
                      <Button
                        variant="secondary"
                        className="w-full rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition-all duration-300"
                        onClick={() => setShowTourModal(true)}
                      >
                        <FiCalendar className="mr-2" size={18} />
                        Request Tour
                      </Button>
                    )}
                  </div>
                )}

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
                      {listing.landlord.role === 'landlord' && listing.landlord.landlordProfile?.companyName && (
                        <p className="text-sm text-gray-500 font-medium">
                          {listing.landlord.landlordProfile.companyName}
                        </p>
                      )}
                      {(listing.landlord.isVerifiedLandlord || listing.landlord.landlordProfile?.isVerified) && (
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

        {/* Reviews Section */}
        <div className="mt-12 bg-white rounded-3xl p-8 shadow-sm">
          <ListingReviews
            listingId={id}
            averageRating={listing.averageRating || 0}
            totalReviews={listing.reviews?.length || 0}
          />
        </div>

        {/* Similar Listings Section */}
        <div className="mt-12">
          <h2 className="text-3xl font-black mb-6">Similar Listings</h2>
          {similarListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarListings.map(similar => (
                <ListingCard key={similar._id} listing={similar} />
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No similar listings found nearby.</p>
          )}
        </div>
      </div>

      {/* Checklist Drawer */}
      {showChecklist && (
        <ChecklistDrawer
          listingId={id}
          onClose={() => setShowChecklist(false)}
        />
      )}

      {/* Tour Request Modal */}
      {showTourModal && (
        <TourRequestModal
          isOpen={showTourModal}
          onClose={() => setShowTourModal(false)}
          listing={listing}
          landlordId={listing.landlord._id}
        />
      )}

      {/* Quick Apply Modal */}
      <QuickApplyModal
        isOpen={showQuickApply}
        onClose={() => setShowQuickApply(false)}
        listing={listing}
        onSuccess={() => setHasApplied(true)}
      />
    </div>
  );
};

export default ListingDetailPage;

