import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import listingService from '../services/listingService';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import CompactListingCard from '../components/Listings/CompactListingCard';
import MapboxMap from '../components/Map/MapboxMap';
import { useFeatureFlags } from '../contexts/FeatureFlagContext';
import { calculateCommuteData } from '../utils/commuteCalculator';
import { FiChevronDown, FiChevronUp, FiMap, FiList, FiSliders } from 'react-icons/fi';
import AdvancedFilterModal from '../components/Listings/AdvancedFilterModal';
import SortDropdown from '../components/Listings/SortDropdown';

const Listings = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isEnabled } = useFeatureFlags();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const [selectedListing, setSelectedListing] = useState(null);
  const [showCommuteLayer, setShowCommuteLayer] = useState(false);
  const [commuteData, setCommuteData] = useState({});
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [mobileView, setMobileView] = useState('list'); // 'map' or 'list'

  // Initialize filters from URL params
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || searchParams.get('city') || '',
    priceMin: searchParams.get('priceMin') || '',
    priceMax: searchParams.get('priceMax') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    bathrooms: searchParams.get('bathrooms') || '',
    leaseTerm: searchParams.get('leaseTerm') || '',
    maxDistance: searchParams.get('maxDistance') || '',
    propertyType: searchParams.get('propertyType') ? searchParams.get('propertyType').split(',') : [],
    amenities: searchParams.get('amenities') ? searchParams.get('amenities').split(',') : [],
    utilitiesIncluded: searchParams.get('utilitiesIncluded') === 'true',
    petFriendly: searchParams.get('petFriendly') === 'true',
    subleaseOnly: searchParams.get('subleaseOnly') === 'true',
    sqftMin: searchParams.get('sqftMin') || '',
    sqftMax: searchParams.get('sqftMax') || '',
    furnished: searchParams.get('furnished') === 'true',
    verifiedLandlordsOnly: searchParams.get('verifiedLandlordsOnly') === 'true',
  });

  // Memoize filters to prevent infinite loop
  const filtersString = useMemo(() => JSON.stringify(filters), [
    filters.search,
    filters.priceMin,
    filters.priceMax,
    filters.bedrooms,
    filters.bathrooms,
    filters.leaseTerm,
    filters.maxDistance,
    JSON.stringify(filters.propertyType),
    JSON.stringify(filters.amenities),
    filters.utilitiesIncluded,
    filters.petFriendly,
    filters.subleaseOnly,
    filters.sqftMin,
    filters.sqftMax,
    filters.furnished,
    filters.verifiedLandlordsOnly,
  ]);

  // Fetch listings
  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = { ...filters, sortBy };
      const data = await listingService.getListings(queryParams);
      let sortedListings = data.listings || [];

      // Client-side sorting
      if (sortBy === 'price-low') {
        sortedListings.sort((a, b) => a.rent - b.rent);
      } else if (sortBy === 'price-high') {
        sortedListings.sort((a, b) => b.rent - a.rent);
      } else if (sortBy === 'newest') {
        sortedListings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else if (sortBy === 'distance') {
        sortedListings.sort((a, b) => (a.distanceToUniversity || Infinity) - (b.distanceToUniversity || Infinity));
      } else if (sortBy === 'popular') {
        sortedListings.sort((a, b) => (b.views || 0) - (a.views || 0));
      }

      setListings(sortedListings);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  }, [filtersString, sortBy]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Handle refresh parameter from CreateListingWizard
  useEffect(() => {
    if (searchParams.get('refresh') === 'true') {
      fetchListings();
      // Clear the refresh param from URL without adding to history
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('refresh');
      navigate(`/listings${newParams.toString() ? '?' + newParams.toString() : ''}`, { replace: true });
    }
  }, [searchParams, navigate]);

  // Calculate commute data
  useEffect(() => {
    if (showCommuteLayer && listings.length > 0) {
      const data = calculateCommuteData(listings);
      setCommuteData(data);
    }
  }, [showCommuteLayer, listings]);

  const handleClearFilters = () => {
    setFilters({
      search: filters.search,
      priceMin: '',
      priceMax: '',
      bedrooms: '',
      bathrooms: '',
      leaseTerm: '',
      maxDistance: '',
      propertyType: '',
      amenities: [],
      utilitiesIncluded: false,
      petFriendly: false,
      subleaseOnly: false,
    });
  };

  // Get active filters count
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.priceMin || filters.priceMax) count++;
    if (filters.bedrooms) count++;
    if (filters.bathrooms) count++;
    if (filters.leaseTerm) count++;
    if (filters.propertyType?.length) count++;
    if (filters.utilitiesIncluded) count++;
    if (filters.petFriendly) count++;
    if (filters.subleaseOnly) count++;
    if (filters.amenities?.length) count += filters.amenities.length;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  const handleMarkerClick = (listing) => {
    setSelectedListing(listing);
    navigate(`/listings/${listing._id}`);
  };

  const handleCardHover = (listing) => {
    setSelectedListing(listing);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* MOBILE LAYOUT */}
      <div className="md:hidden flex flex-col h-full">
        {/* Mobile Header - Search & Filter */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 pt-20">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search location..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="flex-1 px-4 py-3 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              onClick={() => setShowAdvancedFilters(true)}
              className="p-3 bg-gray-100 rounded-full relative"
            >
              <FiSliders size={20} />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile View Toggle */}
        <div className="bg-white border-b border-gray-200 flex">
          <button
            onClick={() => setMobileView('list')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${mobileView === 'list' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500'
              }`}
          >
            <FiList size={18} />
            List
          </button>
          <button
            onClick={() => setMobileView('map')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${mobileView === 'map' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500'
              }`}
          >
            <FiMap size={18} />
            Map
          </button>
        </div>

        {/* Mobile Map View */}
        {mobileView === 'map' && (
          <div className="flex-1 relative">
            <MapboxMap
              listings={listings}
              selectedListing={selectedListing}
              onMarkerClick={handleMarkerClick}
            />
            {/* Results count overlay */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg text-sm font-medium">
              {listings.length} results
            </div>
          </div>
        )}

        {/* Mobile List View */}
        {mobileView === 'list' && (
          <div className="flex-1 overflow-y-auto">
            {/* Results count & Sort */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between z-10">
              <p className="text-sm font-medium text-gray-900">
                {loading ? 'Loading...' : `${listings.length} homes`}
              </p>
              <SortDropdown value={sortBy} onChange={setSortBy} />
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <LoadingSpinner size="lg" />
              </div>
            )}

            {/* Listing Cards - Full width on mobile */}
            {!loading && listings.length > 0 && (
              <div className="px-4 py-4 space-y-4">
                {listings.map((listing) => (
                  <div
                    key={listing._id}
                    onClick={() => navigate(`/listings/${listing._id}`)}
                    className="cursor-pointer"
                  >
                    <CompactListingCard listing={listing} />
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && listings.length === 0 && (
              <div className="text-center py-20 px-4">
                <p className="text-gray-500 text-base">No listings found</p>
                <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
                <button
                  onClick={handleClearFilters}
                  className="mt-4 text-orange-600 font-medium text-sm"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* DESKTOP LAYOUT */}
      <div className="hidden md:flex flex-1 relative">
        {/* Map Section - Full Screen Background */}
        <div className="absolute inset-0 z-0">
          <MapboxMap
            listings={listings}
            selectedListing={selectedListing}
            onMarkerClick={handleMarkerClick}
          />
        </div>

        {/* Listings Section - Floating Panel */}
        <div
          className={`absolute transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) z-10 bg-white shadow-2xl border border-gray-200 overflow-clip origin-top-right ${showFilters
            ? 'top-24 right-4 w-[800px] h-[calc(100vh-8rem)] rounded-3xl flex flex-col'
            : 'top-24 right-4 w-[200px] h-[56px] rounded-full'
            }`}
        >
          {/* Collapse/Expand Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`focus:outline-none transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) flex items-center justify-center z-50 ${showFilters
              ? 'absolute top-4 right-4 w-10 h-10 bg-white shadow-md rounded-full hover:bg-gray-50'
              : 'absolute inset-0 w-full h-full gap-2 font-bold text-gray-900 hover:bg-gray-50'
              }`}
            title={showFilters ? 'Hide listings' : 'Show listings'}
          >
            {showFilters ? (
              <FiChevronDown className="rotate-180" size={20} />
            ) : (
              <>
                <span>Explore homes</span>
                <FiChevronDown size={20} />
              </>
            )}
          </button>

          {/* Panel Content */}
          <div
            className={`flex flex-col h-full transition-opacity duration-200 ${showFilters ? 'delay-300 opacity-100' : 'delay-0 opacity-0 pointer-events-none'
              }`}
          >
            {/* Header */}
            <div className="bg-white p-4 pl-16 z-20">
              <h1 className="text-xl font-black text-gray-900 mb-3">Explore homes</h1>
            </div>

            {/* Scrollable Listings */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 rounded-b-3xl">
              {/* Results Count and Sort */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-700 font-semibold">
                  {loading ? 'Loading...' : `${listings.length} homes`}
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowAdvancedFilters(true)}
                    className="px-4 py-2 border border-gray-300 rounded-full hover:border-black transition-colors font-medium text-sm flex items-center gap-2 bg-white"
                  >
                    <FiSliders size={16} />
                    Filters
                    {activeFiltersCount > 0 && (
                      <span className="bg-black text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>
                  <SortDropdown value={sortBy} onChange={setSortBy} />
                </div>
              </div>

              {/* Loading */}
              {loading && (
                <div className="flex items-center justify-center py-20">
                  <LoadingSpinner size="lg" />
                </div>
              )}

              {/* Listings Grid */}
              {!loading && listings.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {listings.map((listing) => (
                    <div
                      key={listing._id}
                      id={`listing-${listing._id}`}
                      onMouseEnter={() => handleCardHover(listing)}
                      onMouseLeave={() => setSelectedListing(null)}
                      className="transition-transform duration-200 hover:scale-[1.02]"
                    >
                      <CompactListingCard listing={listing} />
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!loading && listings.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-gray-500 text-base">No listings found</p>
                  <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
                  <button
                    onClick={handleClearFilters}
                    className="mt-4 text-orange-600 font-medium text-sm hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filter Modal */}
      <AdvancedFilterModal
        isOpen={showAdvancedFilters}
        onClose={() => setShowAdvancedFilters(false)}
        filters={filters}
        onApply={(newFilters) => setFilters(newFilters)}
      />
    </div>
  );
};

export default Listings;
