import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import listingService from '../services/listingService';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import CompactListingCard from '../components/Listings/CompactListingCard';
import SearchBar from '../components/Listings/SearchBar';
import MapboxMap from '../components/Map/MapboxMap';
import { useFeatureFlags } from '../contexts/FeatureFlagContext';
import { calculateCommuteData } from '../utils/commuteCalculator';
import { FiChevronDown, FiX, FiFilter, FiSliders } from 'react-icons/fi';
import AdvancedFilterModal from '../components/Listings/AdvancedFilterModal';
import HorizontalFilterBar from '../components/Listings/HorizontalFilterBar';
import SortDropdown from '../components/Listings/SortDropdown';

const Listings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
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

  // Note: Removed URL param sync to prevent infinite loop
  // URL params are initialized once from searchParams, but not continuously synced


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

  // Fetch listings when filters or sortBy change
  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = {
        ...filters,
        sortBy,
      };
      const data = await listingService.getListings(queryParams);

      // Client-side sorting to ensure it works immediately
      let sortedListings = data.listings || [];

      if (sortBy === 'price-low') {
        sortedListings.sort((a, b) => a.rent - b.rent);
      } else if (sortBy === 'price-high') {
        sortedListings.sort((a, b) => b.rent - a.rent);
      } else if (sortBy === 'newest') {
        sortedListings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else if (sortBy === 'distance') {
        sortedListings.sort((a, b) => (a.distanceToUniversity || Infinity) - (b.distanceToUniversity || Infinity));
      } else if (sortBy === 'popular') {
        // Assuming views or favorites count, fallback to newest if not available
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

  // Calculate commute data when listings change and commute layer is enabled
  useEffect(() => {
    if (showCommuteLayer && listings.length > 0) {
      const data = calculateCommuteData(listings);
      setCommuteData(data);
    }
  }, [showCommuteLayer, listings]);

  const handleSearch = (searchTerm) => {
    setFilters({ ...filters, search: searchTerm });
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      search: filters.search, // Keep search term
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

  const handleRemoveFilter = (key) => {
    const newFilters = { ...filters };
    if (Array.isArray(newFilters[key])) {
      newFilters[key] = [];
    } else if (typeof newFilters[key] === 'boolean') {
      newFilters[key] = false;
    } else {
      newFilters[key] = '';
    }
    setFilters(newFilters);
  };

  // Get active filters for display
  const getActiveFilters = () => {
    const active = [];
    if (filters.priceMin || filters.priceMax) {
      active.push({
        key: 'price',
        label: `$${filters.priceMin || '0'} - $${filters.priceMax || '∞'}`,
      });
    }
    if (filters.bedrooms) {
      active.push({ key: 'bedrooms', label: `${filters.bedrooms} bedrooms` });
    }
    if (filters.bathrooms) {
      active.push({ key: 'bathrooms', label: `${filters.bathrooms}+ bathrooms` });
    }
    if (filters.leaseTerm) {
      active.push({ key: 'leaseTerm', label: filters.leaseTerm });
    }
    if (filters.propertyType) {
      active.push({ key: 'propertyType', label: filters.propertyType });
    }
    if (filters.utilitiesIncluded) {
      active.push({ key: 'utilitiesIncluded', label: 'Utilities Included' });
    }
    if (filters.petFriendly) {
      active.push({ key: 'petFriendly', label: 'Pet Friendly' });
    }
    if (filters.subleaseOnly) {
      active.push({ key: 'subleaseOnly', label: 'Sublease Only' });
    }
    filters.amenities?.forEach((amenity) => {
      active.push({ key: 'amenities', label: amenity, value: amenity });
    });
    return active;
  };

  const activeFilters = getActiveFilters();

  const handleMarkerClick = (listing) => {
    setSelectedListing(listing);
    // Scroll to the listing card on mobile
    const element = document.getElementById(`listing-${listing._id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleCardHover = (listing) => {
    setSelectedListing(listing);
  };

  const handleCardClick = (listingId) => {
    navigate(`/listings/${listingId}`);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Main Content: Map + Listings */}
      <div className="flex-1 relative">
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
            title={showFilters ? "Hide listings" : "Show listings"}
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

          {/* Panel Content (Hidden when collapsed) */}
          <div className={`flex flex-col h-full transition-opacity duration-200 ${showFilters ? 'delay-300 opacity-100' : 'delay-0 opacity-0 pointer-events-none'}`}>
            {/* Header & Filters */}
            <div className="bg-white p-4 pl-16 z-20">
              <h1 className="text-xl font-black text-gray-900 mb-3">Explore homes</h1>
            </div>

            {/* Scrollable Listings List */}
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
                    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', fill: 'none', height: '16px', width: '16px', stroke: 'currentcolor', strokeWidth: 3, overflow: 'visible' }}>
                      <path fill="none" d="M7 16H3m26 0H15M29 6h-4m-8 0H3m26 20h-4M7 16a4 4 0 1 0 8 0 4 4 0 0 0-8 0zM17 6a4 4 0 1 0 8 0 4 4 0 0 0-8 0zm0 20a4 4 0 1 0 8 0 4 4 0 0 0-8 0zm0 0H3"></path>
                    </svg>
                    Filters
                    {activeFilters.length > 0 && (
                      <span className="bg-black text-white text-xs w-5 h-5 flex items-center justify-center rounded-full ml-1">
                        {activeFilters.length}
                      </span>
                    )}
                  </button>
                  <SortDropdown
                    value={sortBy}
                    onChange={setSortBy}
                  />
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-20">
                  <LoadingSpinner size="lg" />
                </div>
              )}

              {/* Listings - 2 Column Grid */}
              {!loading && listings.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
