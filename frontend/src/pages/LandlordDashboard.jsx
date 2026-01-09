import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ListingDetailContent from '../components/Listings/ListingDetailContent';
import GlassModal from '../components/GlassModal';

// Sub-components
import DashboardOverview from '../components/Landlord/DashboardOverview';
import DashboardListings from '../components/Landlord/DashboardListings';
import DashboardApplications from '../components/Landlord/DashboardApplications';

const LandlordDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedListingId, setSelectedListingId] = useState(null);
  const [appFilterListingId, setAppFilterListingId] = useState(null);

  // Check URL params for tab selection
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && ['overview', 'applications', 'listings'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data } = await api.get('/landlord/listings');
      setListings(data);
    } catch (error) {
      console.error('Error fetching landlord data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToApps = (listingId) => {
    setAppFilterListingId(listingId);
    setActiveTab('applications');
    // Optional: update URL
    navigate(`/landlord/dashboard?tab=applications&listingId=${listingId}`, { replace: true });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview listings={listings} />;
      case 'listings':
        return (
          <DashboardListings
            listings={listings}
            onPreview={setSelectedListingId}
            switchToApps={handleSwitchToApps}
          />
        );
      case 'applications':
        return <DashboardApplications initialListingId={appFilterListingId} />;
      default:
        return <DashboardOverview listings={listings} />;
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="relative min-h-screen w-full font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header & Title */}
        <div className="text-center mb-8 sm:mb-12 cursor-default">
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4 drop-shadow-md">
            Landlord Portal
          </h1>

          {/* Centered Navigation Tabs */}
          <div className="inline-flex bg-white/20 backdrop-blur-xl rounded-full p-1.5 border border-white/20 shadow-lg">
            {['Overview', 'Applications', 'Listings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`px-6 sm:px-8 py-2.5 rounded-full text-sm sm:text-base font-bold transition-all duration-300 ${activeTab === tab.toLowerCase()
                    ? 'bg-orange-500 text-white shadow-lg scale-105'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {renderTabContent()}
        </div>
      </div>

      {/* Listing Preview Modal */}
      {selectedListingId && (
        <GlassModal onClose={() => setSelectedListingId(null)} className="h-[90vh]">
          <div className="relative h-full flex flex-col">
            {/* Modal Handle/Divider */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[80]">
              <div className="w-16 h-1.5 bg-white/40 rounded-full shadow-sm"></div>
            </div>

            <button
              onClick={() => setSelectedListingId(null)}
              className="absolute top-4 right-4 z-[70] p-2 bg-black/20 hover:bg-black/40 rounded-full text-white backdrop-blur-md transition-colors"
            >
              <FiX size={24} />
            </button>
            <div className="flex-1 overflow-y-auto custom-scrollbar rounded-[2.5rem]">
              <ListingDetailContent
                listingId={selectedListingId}
                isModal={true}
                onClose={() => setSelectedListingId(null)}
              />
            </div>
          </div>
        </GlassModal>
      )}
    </div>
  );
};

export default LandlordDashboard;
