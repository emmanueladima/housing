import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import listingService from '../services/listingService';
import CompactListingCard from '../components/Listings/CompactListingCard';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import Button from '../components/shared/Button';

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black text-gray-900 mb-8">Saved Listings</h1>

        {savedListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {savedListings.map(listing => (
              <div key={listing._id} className="h-full">
                <CompactListingCard listing={listing} />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">No saved listings yet</h2>
            <p className="text-gray-600 mb-6">Start exploring and save your favorite homes!</p>
            <Button onClick={() => navigate('/listings')}>
              Explore Homes
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedSearches;

