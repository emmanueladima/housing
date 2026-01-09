import React, { useState, useEffect } from 'react';
import { FiHome, FiMessageSquare, FiTrendingUp, FiPlus, FiEdit, FiEye, FiUsers, FiX } from 'react-icons/fi';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ListingDetailContent from '../components/Listings/ListingDetailContent';
import GlassModal from '../components/GlassModal';

const MetricCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white/20 backdrop-blur-xl p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-white/30 shadow-lg flex items-center gap-3 sm:gap-4">
    <div className={`p-3 sm:p-4 rounded-lg sm:rounded-xl ${color}`}>
      <Icon size={20} className="text-white sm:w-6 sm:h-6" />
    </div>
    <div>
      <p className="text-white/70 text-xs sm:text-sm font-medium">{label}</p>
      <h3 className="text-xl sm:text-2xl font-bold text-white">{value}</h3>
    </div>
  </div>
);

const LandlordDashboard = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedListingId, setSelectedListingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [metricsRes, listingsRes] = await Promise.all([
        api.get('/landlord/dashboard/metrics'),
        api.get('/landlord/listings')
      ]);
      setMetrics(metricsRes.data.metrics);
      setListings(listingsRes.data.listings || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;

  return (
    <div className="min-h-screen relative pb-24">
      {/* Header */}
      <div className="relative pt-32 pb-8">
        <div className="relative z-10 flex items-center justify-center">
          <h1 className="text-2xl sm:text-3xl font-black text-white">Landlord Dashboard</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10 space-y-6 sm:space-y-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <MetricCard
            icon={FiHome}
            label="Total Listings"
            value={metrics?.totalListings || 0}
            color="bg-blue-500"
          />
          <MetricCard
            icon={FiTrendingUp}
            label="Total Views"
            value={metrics?.totalViews || 0}
            color="bg-green-500"
          />
          <MetricCard
            icon={FiMessageSquare}
            label="Conversations"
            value={metrics?.totalMessages || 0}
            color="bg-orange-500"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white/20 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-white/30 shadow-lg">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <button
              onClick={() => navigate('/listings/create')}
              className="p-4 sm:p-6 border-2 border-dashed border-white/30 rounded-xl hover:border-white/60 hover:bg-white/10 transition-all flex flex-col items-center justify-center gap-2 sm:gap-3 group"
            >
              <div className="p-2 sm:p-3 bg-white/20 rounded-full text-white group-hover:scale-110 transition-transform">
                <FiPlus size={20} />
              </div>
              <span className="font-bold text-white text-xs sm:text-base text-center">Post Listing</span>
            </button>

            <button
              onClick={() => navigate('/landlord/applications')}
              className="p-4 sm:p-6 border-2 border-dashed border-white/30 rounded-xl hover:border-white/60 hover:bg-white/10 transition-all flex flex-col items-center justify-center gap-2 sm:gap-3 group"
            >
              <div className="p-2 sm:p-3 bg-white/20 rounded-full text-white group-hover:scale-110 transition-transform">
                <FiUsers size={20} />
              </div>
              <span className="font-bold text-white text-xs sm:text-base text-center">Review Apps</span>
            </button>

            <button
              onClick={() => navigate('/messages')}
              className="p-4 sm:p-6 border-2 border-dashed border-white/30 rounded-xl hover:border-white/60 hover:bg-white/10 transition-all flex flex-col items-center justify-center gap-2 sm:gap-3 group"
            >
              <div className="p-2 sm:p-3 bg-white/20 rounded-full text-white group-hover:scale-110 transition-transform">
                <FiMessageSquare size={20} />
              </div>
              <span className="font-bold text-white text-xs sm:text-base text-center">Messages</span>
            </button>
          </div>
        </div>

        {/* My Listings */}
        <div className="bg-white/20 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-white/30 shadow-lg">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-white">My Listings</h2>
            <Link to="/listings/create" className="text-yellow-200 font-bold hover:text-white flex items-center gap-1 text-sm">
              <FiPlus size={14} />
              <span className="hidden sm:inline">Add New</span>
              <span className="sm:hidden">Add</span>
            </Link>
          </div>

          {listings.length === 0 ? (
            <div className="text-center py-12 text-white/60">
              <FiHome size={48} className="mx-auto mb-4 text-white/30" />
              <p className="font-medium">No listings yet</p>
              <p className="text-sm">Create your first listing to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {listings.map((listing) => (
                <div key={listing._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-colors gap-3">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-white/20 overflow-hidden flex-shrink-0">
                      {listing.images?.[0] ? (
                        <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/50">
                          <FiHome size={20} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-white text-sm sm:text-base truncate">{listing.title}</h3>
                      <p className="text-xs sm:text-sm text-white/70 truncate">{listing.city}, {listing.state} • ${listing.rent}/mo</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-white/50 flex items-center gap-1">
                          <FiEye size={10} />
                          {listing.totalViews || 0}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${listing.isActive ? 'bg-green-500/30 text-green-200' : 'bg-white/20 text-white/60'}`}>
                          {listing.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {listing.totalApplications > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/30 text-orange-200 flex items-center gap-1">
                            <FiUsers size={10} />
                            {listing.totalApplications} Apps
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Link
                      to={`/landlord/applications?listingId=${listing._id}`}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium text-xs sm:text-sm flex items-center gap-1"
                    >
                      <FiUsers size={14} />
                      <span className="hidden sm:inline">Apps</span>
                    </Link>
                    <button
                      onClick={() => setSelectedListingId(listing._id)}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors font-medium text-xs sm:text-sm"
                    >
                      View
                    </button>
                    <button
                      onClick={() => navigate(`/listings/edit/${listing._id}`)}
                      className="p-1.5 sm:p-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                    >
                      <FiEdit size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Listing Preview Modal */}
      {selectedListingId && (
        <GlassModal onClose={() => setSelectedListingId(null)} className="h-[90vh]">
          <div className="relative h-full flex flex-col">
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
