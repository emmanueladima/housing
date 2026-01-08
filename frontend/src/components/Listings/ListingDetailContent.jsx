import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiMapPin, FiHeart, FiSquare, FiHome, FiCalendar, FiDollarSign,
    FiCheck, FiX, FiMail, FiPhone, FiArrowLeft, FiShare2, FiMoreHorizontal, FiFlag, FiUser,
    FiChevronLeft, FiChevronRight, FiZap, FiEdit, FiEye, FiBook
} from 'react-icons/fi';
import listingService from '../../services/listingService';
import LoadingSpinner from '../shared/LoadingSpinner';
import Badge from '../shared/Badge';
import Button from '../shared/Button';
import { formatPrice } from '../../utils/priceFormatter';
import { useAuth } from '../../contexts/AuthContext';
import { useFeatureFlags } from '../../contexts/FeatureFlagContext';

import ChecklistDrawer from '../Listings/ChecklistDrawer';
import MiniMap from '../Map/MiniMap';
import ListingCard from '../Listings/ListingCard';
import { Card } from '@heroui/card';
import TourRequestModal from '../Listings/TourRequestModal';
import QuickApplyModal from '../applications/QuickApplyModal';
import ListingReviews from '../Listings/ListingReviews';
import GlassCard from '../shared/GlassCard';

const ListingDetailContent = ({ listingId, onClose, isModal = false }) => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const { isEnabled } = useFeatureFlags();
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
                const data = await listingService.getListing(listingId);
                setListing(data);
                setIsFavorite(user?.favorites?.includes(listingId) || false);

                // Fetch similar listings
                const similar = await listingService.getSimilarListings(data);
                setSimilarListings(similar);
            } catch (error) {
                console.error('Error fetching listing:', error);
            } finally {
                setLoading(false);
            }
        };

        if (listingId) {
            fetchListing();
        }
    }, [listingId, user]);

    const handleFavoriteToggle = async () => {
        if (!isAuthenticated) {
            alert('Please log in to save favorites');
            return;
        }
        try {
            await listingService.toggleFavorite(listingId);
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
        const reason = prompt("Please provide a reason for reporting this listing:");
        if (reason) {
            alert("Thank you for your report. We will review this listing.");
            setShowMoreMenu(false);
        }
    };

    if (loading) {
        return (
            <div className={`flex items-center justify-center bg-gray-50 ${isModal ? 'h-full min-h-[400px]' : 'min-h-screen'}`}>
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!listing) {
        return (
            <div className={`flex flex-col items-center justify-center bg-gray-50 ${isModal ? 'h-full min-h-[400px]' : 'min-h-screen'}`}>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Listing not found</h1>
                {!isModal && <Button onClick={() => navigate('/listings')}>Back to Listings</Button>}
            </div>
        );
    }

    const primaryImage = listing.images && listing.images[selectedImage]
        ? listing.images[selectedImage]
        : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800';

    return (
        <div className={`${isModal ? 'bg-transparent pb-10' : 'bg-gray-50 min-h-screen'}`}>
            {/* Header */}
            {!isModal && (
                <div className="bg-white border-b sticky top-0 z-[60] pt-20 sm:pt-0">
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
            )}




            <div className={`max-w-7xl mx-auto ${isModal ? 'p-0' : 'px-4 sm:px-6 lg:px-8 py-8'}`}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Image Gallery */}
                        <div className={isModal ? 'px-4 sm:px-6 pt-6' : ''}>
                            {isModal ? (
                                <div className="relative rounded-[2rem] overflow-hidden bg-black/20 border border-white/10 shadow-xl">
                                    <div className="relative h-64 sm:h-80 md:h-96 group">
                                        <img
                                            src={primaryImage}
                                            alt={listing.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800';
                                            }}
                                        />

                                        {/* Navigation Arrows - Only show if multiple images */}
                                        {listing.images && listing.images.length > 1 && (
                                            <>
                                                <button
                                                    onClick={() => setSelectedImage(selectedImage === 0 ? listing.images.length - 1 : selectedImage - 1)}
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 backdrop-blur-md rounded-full shadow-lg hover:bg-black/60 text-white transition-all hover:scale-110 z-10 border border-white/20"
                                                >
                                                    <FiChevronLeft size={24} />
                                                </button>
                                                <button
                                                    onClick={() => setSelectedImage(selectedImage === listing.images.length - 1 ? 0 : selectedImage + 1)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 backdrop-blur-md rounded-full shadow-lg hover:bg-black/60 text-white transition-all hover:scale-110 z-10 border border-white/20"
                                                >
                                                    <FiChevronRight size={24} />
                                                </button>

                                                {/* Carousel Dots */}
                                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                                                    {listing.images.map((_, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => setSelectedImage(index)}
                                                            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${selectedImage === index
                                                                ? 'bg-white w-8'
                                                                : 'bg-white/50 hover:bg-white/80'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <GlassCard
                                    className="rounded-[2rem] bg-white/60 dark:bg-default-100/50 backdrop-blur-xl overflow-hidden shadow-sm border-none"
                                    padding="none"
                                >
                                    <div className="relative h-64 sm:h-80 md:h-96 bg-gray-100 group">
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
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/40 backdrop-blur-md rounded-full shadow-lg hover:bg-white text-gray-800 transition-all hover:scale-110 z-10 border border-white/20"
                                                >
                                                    <FiChevronLeft size={24} />
                                                </button>
                                                <button
                                                    onClick={() => setSelectedImage(selectedImage === listing.images.length - 1 ? 0 : selectedImage + 1)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/40 backdrop-blur-md rounded-full shadow-lg hover:bg-white text-gray-800 transition-all hover:scale-110 z-10 border border-white/20"
                                                >
                                                    <FiChevronRight size={24} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                    {listing.images && listing.images.length > 1 && (
                                        <div className="grid grid-cols-5 gap-2 p-4 bg-white/40">
                                            {listing.images.slice(0, 5).map((image, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setSelectedImage(index)}
                                                    className={`relative h-16 sm:h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${selectedImage === index
                                                        ? 'border-orange-500 scale-105 shadow-md'
                                                        : 'border-transparent hover:border-gray-300 hover:scale-105'
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
                                </GlassCard>
                            )}
                        </div>

                        {/* Title and Basic Info */}
                        <div className={isModal ? 'px-4 sm:px-6' : ''}>
                            {isModal ? (
                                <div className="p-2">
                                    <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-2 sm:mb-4 tracking-tight">
                                        {listing.title}
                                    </h1>

                                    <div className="flex items-center text-gray-300 mb-3 sm:mb-4 font-medium">
                                        <FiMapPin className="mr-2 flex-shrink-0 text-white" size={18} />
                                        <span className="text-sm sm:text-lg truncate">
                                            {listing.address}, {listing.city}, {listing.state} {listing.zipCode}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap gap-3 sm:gap-6 py-3 sm:py-4 border-y border-white/10 text-sm sm:text-base">
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 text-white rounded-lg backdrop-blur-md">
                                            {listing.bedrooms === 0 ? (
                                                <>
                                                    <FiHome className="text-white" size={20} />
                                                    <span className="font-bold">Studio</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FiSquare className="text-white" size={20} />
                                                    <span className="font-bold">{listing.bedrooms} Bedrooms</span>
                                                </>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 text-white rounded-lg backdrop-blur-md">
                                            <FiHome className="text-white" size={20} />
                                            <span className="font-bold">{listing.bathrooms} Bathrooms</span>
                                        </div>
                                        {listing.sqft && (
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 text-white rounded-lg backdrop-blur-md">
                                                <span className="font-bold">{listing.sqft} sq ft</span>
                                            </div>
                                        )}
                                        {listing.distanceToUniversity && (
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 text-white rounded-lg backdrop-blur-md">
                                                <FiMapPin className="text-white" size={18} />
                                                <span className="font-bold">{listing.distanceToUniversity} mi to campus</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <GlassCard className="bg-white/60 dark:bg-default-100/50 rounded-[2rem] shadow-lg border-none hover:shadow-xl transition-shadow">
                                    <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 mb-2 sm:mb-4 tracking-tight">
                                        {listing.title}
                                    </h1>

                                    <div className="flex items-center text-gray-600 mb-3 sm:mb-4 font-medium">
                                        <FiMapPin className="mr-2 flex-shrink-0 text-orange-500" size={18} />
                                        <span className="text-sm sm:text-lg truncate">
                                            {listing.address}, {listing.city}, {listing.state} {listing.zipCode}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap gap-3 sm:gap-6 py-3 sm:py-4 border-y border-gray-200/50 text-sm sm:text-base">
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 text-gray-800 rounded-lg backdrop-blur-md">
                                            {listing.bedrooms === 0 ? (
                                                <>
                                                    <FiHome className="text-orange-500" size={20} />
                                                    <span className="font-bold">Studio</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FiSquare className="text-orange-500" size={20} />
                                                    <span className="font-bold">{listing.bedrooms} Bedrooms</span>
                                                </>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 text-gray-800 rounded-lg backdrop-blur-md">
                                            <FiHome className="text-orange-500" size={20} />
                                            <span className="font-bold">{listing.bathrooms} Bathrooms</span>
                                        </div>
                                        {listing.sqft && (
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 text-gray-800 rounded-lg backdrop-blur-md">
                                                <span className="font-bold">{listing.sqft} sq ft</span>
                                            </div>
                                        )}
                                        {listing.distanceToUniversity && (
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 text-gray-800 rounded-lg backdrop-blur-md">
                                                <FiMapPin className="text-orange-500" size={18} />
                                                <span className="font-bold">{listing.distanceToUniversity} mi to campus</span>
                                            </div>
                                        )}
                                    </div>
                                </GlassCard>
                            )}
                        </div>

                        {/* Description */}
                        <div className={isModal ? 'px-4 sm:px-6' : ''}>
                            {isModal ? (
                                <div className="p-2">
                                    <h2 className="text-2xl font-bold mb-4 text-white">Description</h2>
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

                                    <p className="text-gray-200 leading-relaxed whitespace-pre-wrap font-medium">
                                        {listing.description}
                                    </p>
                                </div>
                            ) : (
                                <GlassCard className="bg-white/60 dark:bg-default-100/50 rounded-[2rem] shadow-lg border-none hover:shadow-xl transition-shadow">
                                    <h2 className="text-2xl font-bold mb-4 text-gray-900">Description</h2>
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

                                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
                                        {listing.description}
                                    </p>
                                </GlassCard>
                            )}
                        </div>

                        {/* Amenities */}
                        {listing.amenities && listing.amenities.length > 0 && (
                            <div className={isModal ? 'px-4 sm:px-6' : ''}>
                                {isModal ? (
                                    <div className="p-2">
                                        <h2 className="text-2xl font-bold mb-6 text-white">Amenities</h2>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {listing.amenities.map((amenity, index) => (
                                                <div key={index} className="flex items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10">
                                                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-green-500/20 rounded-lg text-green-300">
                                                        <FiCheck size={16} />
                                                    </div>
                                                    <span className="text-gray-200 font-bold text-sm capitalize">{amenity}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <GlassCard className="bg-white/60 dark:bg-default-100/50 rounded-[2rem] shadow-lg border-none hover:shadow-xl transition-shadow">
                                        <h2 className="text-2xl font-bold mb-6 text-gray-900">Amenities</h2>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {listing.amenities.map((amenity, index) => (
                                                <div key={index} className="flex items-center gap-3 bg-white/40 p-3 rounded-xl backdrop-blur-sm">
                                                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-green-100 rounded-lg text-green-600">
                                                        <FiCheck size={16} />
                                                    </div>
                                                    <span className="text-gray-800 font-bold text-sm">{amenity}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </GlassCard>
                                )}
                            </div>
                        )}

                        {/* Details */}
                        <div className={isModal ? 'px-4 sm:px-6' : ''}>
                            {isModal ? (
                                <div className="p-2">
                                    <h2 className="text-2xl font-bold mb-4 text-white">Details</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex justify-between items-center py-4 px-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                                            <span className="text-gray-200 font-medium">Lease Term</span>
                                            <span className="font-bold text-white">{listing.leaseTerm}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-4 px-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                                            <span className="text-gray-200 font-medium">Available Date</span>
                                            <span className="font-bold text-white">
                                                {new Date(listing.availableDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-4 px-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                                            <span className="text-gray-200 font-medium">Pets</span>
                                            <span className="font-bold text-white">
                                                {listing.rules?.petsAllowed ? 'Allowed' : 'Not Allowed'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-4 px-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                                            <span className="text-gray-200 font-medium">Smoking</span>
                                            <span className="font-bold text-white">
                                                {listing.rules?.smokingAllowed ? 'Allowed' : 'Not Allowed'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <GlassCard className="bg-white/60 dark:bg-default-100/50 rounded-[2rem] shadow-lg border-none hover:shadow-xl transition-shadow">
                                    <h2 className="text-2xl font-bold mb-4 text-gray-900">Details</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex justify-between items-center py-4 px-4 bg-white/40 rounded-xl backdrop-blur-sm">
                                            <span className="text-gray-600 font-medium">Lease Term</span>
                                            <span className="font-bold text-gray-900">{listing.leaseTerm}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-4 px-4 bg-white/40 rounded-xl backdrop-blur-sm">
                                            <span className="text-gray-600 font-medium">Available Date</span>
                                            <span className="font-bold text-gray-900">
                                                {new Date(listing.availableDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-4 px-4 bg-white/40 rounded-xl backdrop-blur-sm">
                                            <span className="text-gray-600 font-medium">Pets</span>
                                            <span className="font-bold text-gray-900">
                                                {listing.rules?.petsAllowed ? 'Allowed' : 'Not Allowed'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-4 px-4 bg-white/40 rounded-xl backdrop-blur-sm">
                                            <span className="text-gray-600 font-medium">Smoking</span>
                                            <span className="font-bold text-gray-900">
                                                {listing.rules?.smokingAllowed ? 'Allowed' : 'Not Allowed'}
                                            </span>
                                        </div>
                                    </div>
                                </GlassCard>
                            )}
                        </div>

                        {/* Location & Map */}
                        {listing.coordinates?.lat && listing.coordinates?.lng && (
                            <div className={isModal ? 'px-4 sm:px-6' : ''}>
                                <GlassCard
                                    className={`${isModal ? '!bg-white/5 border-white/10' : 'bg-white/60 dark:bg-default-100/50'} rounded-[2rem] shadow-lg border-none hover:shadow-xl transition-shadow`}
                                >
                                    <h2 className={`text-2xl font-bold mb-4 ${isModal ? 'text-white' : 'text-gray-900'}`}>Location</h2>
                                    <MiniMap
                                        coordinates={listing.coordinates}
                                        rent={listing.rent}
                                        address={`${listing.address}, ${listing.city}, ${listing.state}`}
                                    />
                                </GlassCard>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className={`lg:col-span-1 ${isModal ? 'px-4 sm:px-6 pt-6 order-first lg:order-last' : ''}`}>
                        <div className={`${isModal ? '' : 'sticky top-28'} space-y-6`}>
                            {/* Price and Actions */}
                            <GlassCard
                                className={`${isModal ? '!bg-white/5 border-white/10' : 'bg-white/70'} rounded-[2rem] shadow-lg border border-white/40`}
                                padding="lg"
                            >
                                <div className="text-center mb-6">
                                    <div className={`text-4xl font-black ${isModal ? 'text-white' : 'text-gray-900'} mb-1`}>
                                        {formatPrice(listing.rent)}
                                    </div>
                                    <div className={isModal ? 'text-gray-300' : 'text-gray-600'}>per month</div>
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
                                            className="w-full py-2 text-gray-800 font-medium hover:text-orange-600 transition-colors"
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
                            </GlassCard>

                            {/* Landlord Info */}
                            {listing.landlord && (
                                <GlassCard
                                    className={`${isModal ? '!bg-white/5 border-white/10' : 'bg-white/60 dark:bg-default-100/50'} rounded-[2rem] shadow-lg border-none mt-6 hover:shadow-xl transition-shadow`}
                                >
                                    <h3 className={`text-lg font-bold mb-4 ${isModal ? 'text-white' : 'text-gray-900'}`}>Landlord</h3>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center shadow-inner">
                                            <span className="text-xl font-bold text-orange-600">
                                                {listing.landlord.firstName?.[0]}{listing.landlord.lastName?.[0]}
                                            </span>
                                        </div>
                                        <div>
                                            <p className={`font-bold ${isModal ? 'text-white' : 'text-gray-900'}`}>
                                                {listing.landlord.firstName} {listing.landlord.lastName}
                                            </p>
                                            {listing.landlord.role === 'landlord' && listing.landlord.landlordProfile?.companyName && (
                                                <p className={`text-sm ${isModal ? 'text-gray-200' : 'text-gray-500'} font-medium`}>
                                                    {listing.landlord.landlordProfile.companyName}
                                                </p>
                                            )}
                                            {(listing.landlord.isVerifiedLandlord || listing.landlord.landlordProfile?.isVerified) && (
                                                <p className="text-sm text-green-600 flex items-center gap-1 font-bold">
                                                    <FiCheck size={14} />
                                                    Verified Landlord
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {listing.showPhoneNumber !== false && listing.landlord.phone && (
                                        <div className={`flex items-center gap-2 text-sm ${isModal ? 'text-gray-300 bg-white/10' : 'text-gray-600 bg-white/40'} p-3 rounded-xl backdrop-blur-sm`}>
                                            <FiPhone size={16} />
                                            <span className="font-medium">{listing.landlord.phone}</span>
                                        </div>
                                    )}
                                </GlassCard>
                            )}

                            {/* University */}
                            {listing.university && (
                                <GlassCard
                                    className={`${isModal ? '!bg-white/5 border-white/10' : 'bg-white/60 dark:bg-default-100/50'} rounded-[2rem] shadow-lg border-none mt-6 hover:shadow-xl transition-shadow`}
                                >
                                    <h3 className={`text-lg font-bold mb-2 ${isModal ? 'text-white' : 'text-gray-900'}`}>University</h3>
                                    <div className={`flex items-center gap-3 ${isModal ? 'text-white' : 'text-gray-800'} font-medium`}>
                                        <span className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><FiBook size={18} /></span>
                                        {listing.university}
                                    </div>
                                </GlassCard>
                            )}
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className={`mt-12 ${isModal ? 'bg-white/5 border-white/10 mx-4 sm:mx-6' : 'bg-white/60 border-white/40'} backdrop-blur-xl rounded-[2rem] p-8 shadow-sm border`}>
                    <ListingReviews
                        listingId={listingId}
                        averageRating={listing.averageRating || 0}
                        totalReviews={listing.reviews?.length || 0}
                        darkMode={isModal}
                    />
                </div>

                {/* Similar Listings Section */}
                <div className={`mt-12 ${isModal ? 'mx-4 sm:mx-6' : ''}`}>
                    <h2 className={`text-3xl font-black mb-6 ${isModal ? 'text-white' : 'text-gray-900'}`}>Similar Listings</h2>
                    {similarListings.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {similarListings.map(similar => (
                                <ListingCard key={similar._id} listing={similar} />
                            ))}
                        </div>
                    ) : (
                        <p className={isModal ? 'text-gray-200' : 'text-gray-600'}>No similar listings found nearby.</p>
                    )}
                </div>
            </div>

            {/* Checklist Drawer */}
            {showChecklist && (
                <ChecklistDrawer
                    listingId={listingId}
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

export default ListingDetailContent;
