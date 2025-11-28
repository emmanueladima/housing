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

const Listings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isEnabled } = useFeatureFlags();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
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
    <div className="h-screen flex flex-col bg-white">
      {/* Main Content: Map + Listings */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map Section - Left Side (70%) */}
        <div className="flex-1 relative">
          <MapboxMap
            listings={listings}
            selectedListing={selectedListing}
            onMarkerClick={handleMarkerClick}
          />
        </div>

        {/* Listings Section - Right Side (Fixed Width 800px for 2 columns) */}
        <div className="w-[800px] flex-shrink-0 overflow-y-auto bg-gray-50 border-l border-gray-200 relative">
          {/* Horizontal Filter Bar - Sticky at top of sidebar */}
          <HorizontalFilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
            onMoreFiltersClick={() => setShowAdvancedFilters(true)}
            activeFilterCount={activeFilters.length}
          />

          <div className="p-3">
            {/* Results Count and Sort */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
              <p className="text-sm text-gray-700 font-semibold">
                {loading ? 'Loading...' : `${listings.length} homes`}
              </p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-orange-500 bg-white"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low-High</option>
                <option value="price-high">Price: High-Low</option>
                <option value="popular">Popular</option>
                <option value="distance">Distance</option>
              </select>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <LoadingSpinner size="lg" />
              </div>
            )}

            {/* Listings - 2 Column Grid */}
            {!loading && listings.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {listings.map((listing) => (
                  <div
                    key={listing._id}
                    id={`listing-${listing._id}`}
                    onMouseEnter={() => handleCardHover(listing)}
                    onMouseLeave={() => setSelectedListing(null)}
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
              </div>
            )}
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
