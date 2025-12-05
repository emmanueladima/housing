import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import listingService from '../services/listingService';
import CompactListingCard from '../components/Listings/CompactListingCard';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ModernBackground from '../components/shared/ModernBackground';
import { FiSearch, FiArrowRight } from 'react-icons/fi';

const SavedSearches = () => {
  const [savedListings, setSavedListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSavedListings = async () => {
      try {
        const listings = await listingService.getSavedListings();
        setSavedListings(listings);
      } catch (error) {
        console.error('Error fetching saved listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedListings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header with Orange Gradient & Orbs */}
      <div className="relative overflow-hidden pt-32 pb-16">
        <ModernBackground />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 mb-6">
              <FiSearch className="text-yellow-200" size={16} />
              <span className="text-yellow-100 text-sm font-bold uppercase tracking-wider">Your Searches</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Saved Listings
            </h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Quick access to homes you've saved while searching.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {savedListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {savedListings.map(listing => (
                <div key={listing._id} className="h-full">
                  <CompactListingCard listing={listing} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center mb-6">
                <FiSearch className="text-orange-500" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No saved listings yet</h3>
              <p className="text-gray-500 mb-8 max-w-md text-center">
                Start exploring and save your favorite homes!
              </p>
              <Link
                to="/listings"
                className="inline-flex items-center gap-2 px-8 py-3 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <span>Explore Homes</span>
                <FiArrowRight />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedSearches;
