import React, { useState, useEffect } from 'react';
import { FiHeart, FiMap, FiUsers, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import listingService from '../services/listingService';
import lifestyleProfileService from '../services/lifestyleProfileService';
import ListingCard from '../components/Listings/ListingCard';
import RoommateCard from '../components/Roommates/RoommateCard';
import RoommateDetailsModal from '../components/Roommates/RoommateDetailsModal';
import ModernBackground from '../components/shared/ModernBackground';

const SavedPage = () => {
    const [activeTab, setActiveTab] = useState('listings');
    const [listings, setListings] = useState([]);
    const [roommates, setRoommates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRoommate, setSelectedRoommate] = useState(null);

    useEffect(() => {
        fetchSavedItems();
    }, []);

    const fetchSavedItems = async () => {
        setLoading(true);
        try {
            const [listingsData, roommatesData] = await Promise.all([
                listingService.getSavedListings(),
                lifestyleProfileService.getSavedProfiles()
            ]);
            setListings(Array.isArray(listingsData) ? listingsData : (listingsData?.listings || []));
            setRoommates(roommatesData?.profiles || roommatesData || []);
        } catch (error) {
            console.error('Error fetching saved items:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUnsaveListing = async (listingId) => {
        try {
            await listingService.toggleFavorite(listingId);
            setListings(prev => prev.filter(l => l._id !== listingId));
        } catch (error) {
            console.error('Error removing listing:', error);
        }
    };

    const handleUnsaveRoommate = async (profileId) => {
        try {
            await lifestyleProfileService.toggleSavedProfile(profileId);
            setRoommates(prev => prev.filter(p => p._id !== profileId));
        } catch (error) {
            console.error('Error removing roommate:', error);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Header with Orange Gradient & Orbs - extends to very top */}
            <div className="relative overflow-hidden">
                {/* Orange Gradient Background - positioned from top */}
                <div className="absolute inset-0">
                    <ModernBackground />
                </div>

                {/* Content with top padding for navbar */}
                <div className="relative z-10 pt-24 sm:pt-32 pb-10 sm:pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Title & Subtitle */}
                    <div className="text-center mb-6 sm:mb-10">
                        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 mb-4 sm:mb-6">
                            <FiHeart className="text-yellow-200" size={14} />
                            <span className="text-yellow-100 text-xs sm:text-sm font-bold uppercase tracking-wider">Your Collection</span>
                        </div>
                        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white mb-2 sm:mb-4 tracking-tight">
                            Saved Items
                        </h1>
                        <p className="text-white/80 text-sm sm:text-lg max-w-2xl mx-auto">
                            Your collection of favorite places and potential roommates.
                        </p>
                    </div>

                    {/* Pill Tabs */}
                    <div className="flex justify-center">
                        <div className="inline-flex items-center p-1 sm:p-1.5 bg-white/20 backdrop-blur-md rounded-full border border-white/20">
                            <button
                                onClick={() => setActiveTab('listings')}
                                className={`flex items-center gap-1 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full transition-all duration-300 text-sm sm:text-base ${activeTab === 'listings'
                                    ? 'bg-white text-orange-600 shadow-lg font-bold'
                                    : 'text-white hover:bg-white/10 font-bold'
                                    }`}
                            >
                                <FiMap size={16} />
                                <span className="hidden sm:inline">Listings</span>
                                <span className="sm:hidden">Places</span>
                                <span className={`ml-1 px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'listings' ? 'bg-orange-100 text-orange-600' : 'bg-white/20 text-white'}`}>
                                    {listings.length}
                                </span>
                            </button>
                            <button
                                onClick={() => setActiveTab('roommates')}
                                className={`flex items-center gap-1 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full transition-all duration-300 text-sm sm:text-base ${activeTab === 'roommates'
                                    ? 'bg-white text-orange-600 shadow-lg font-bold'
                                    : 'text-white hover:bg-white/10 font-bold'
                                    }`}
                            >
                                <FiUsers size={16} />
                                <span>People</span>
                                <span className={`ml-1 px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'roommates' ? 'bg-orange-100 text-orange-600' : 'bg-white/20 text-white'}`}>
                                    {roommates.length}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
                    {/* Content */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                        </div>
                    ) : (
                        <div className="min-h-[400px]">
                            {activeTab === 'listings' ? (
                                listings.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                        {listings.map(listing => (
                                            <ListingCard
                                                key={listing._id}
                                                listing={listing}
                                                onToggleFavorite={() => handleUnsaveListing(listing._id)}
                                                isFavorite={true}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        icon={FiMap}
                                        title="No saved listings yet"
                                        description="Start exploring to find your perfect place."
                                        actionLink="/listings"
                                        actionText="Browse Listings"
                                    />
                                )
                            ) : (
                                roommates.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                        {roommates.map(profile => (
                                            <RoommateCard
                                                key={profile._id}
                                                profile={profile}
                                                onClick={() => setSelectedRoommate(profile)}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        icon={FiUsers}
                                        title="No saved roommates yet"
                                        description="Find people who match your lifestyle and vibe."
                                        actionLink="/roommates"
                                        actionText="Find Roommates"
                                    />
                                )
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Roommate Details Modal */}
            <RoommateDetailsModal
                isOpen={!!selectedRoommate}
                onClose={() => setSelectedRoommate(null)}
                roommate={selectedRoommate}
                onFavorite={() => selectedRoommate && handleUnsaveRoommate(selectedRoommate._id)}
            />
        </div>
    );
};

const EmptyState = ({ icon: Icon, title, description, actionLink, actionText }) => (
    <div className="flex flex-col items-center justify-center py-12 sm:py-20 bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 mx-auto">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center mb-4 sm:mb-6">
            <Icon className="text-orange-500" size={28} />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 mb-6 sm:mb-8 max-w-md text-center text-sm sm:text-base px-4">{description}</p>
        <Link
            to={actionLink}
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm sm:text-base"
        >
            <span>{actionText}</span>
            <FiArrowRight />
        </Link>
    </div>
);

export default SavedPage;
