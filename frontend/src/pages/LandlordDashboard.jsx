import React, { useState, useEffect } from 'react';
import { FiHome, FiMessageSquare, FiTrendingUp, FiPlus, FiZap, FiEdit, FiEye, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import ModernBackground from '../components/shared/ModernBackground';
import LoadingSpinner from '../components/shared/LoadingSpinner';

const MetricCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`p-4 rounded-xl ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <p className="text-gray-500 text-sm font-medium">{label}</p>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
    </div>
  </div>
);

const LandlordDashboard = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [boostingId, setBoostingId] = useState(null);

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

  const handleBoostToggle = async (listingId, currentlyBoosted) => {
    setBoostingId(listingId);
    try {
      if (currentlyBoosted) {
        await api.delete(`/landlord/boost/${listingId}`);
      } else {
        await api.post(`/landlord/boost/${listingId}`, { days: 7 });
      }
      // Refresh listings
      const { data } = await api.get('/landlord/listings');
      setListings(data.listings || []);
    } catch (error) {
      console.error('Error toggling boost:', error);
      alert('Failed to toggle boost');
    } finally {
      setBoostingId(null);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="relative h-48 overflow-hidden mb-8">
        <ModernBackground />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-3xl font-black text-white">Landlord Dashboard</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-12 space-y-8 relative z-10">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => navigate('/listings/create')}
              className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all flex flex-col items-center justify-center gap-3 group"
            >
              <div className="p-3 bg-orange-100 rounded-full text-orange-600 group-hover:scale-110 transition-transform">
                <FiPlus size={24} />
              </div>
              <span className="font-bold text-gray-700 group-hover:text-orange-700">Post New Listing</span>
            </button>

            <button
              onClick={() => navigate('/messages')}
              className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center justify-center gap-3 group"
            >
              <div className="p-3 bg-blue-100 rounded-full text-blue-600 group-hover:scale-110 transition-transform">
                <FiMessageSquare size={24} />
              </div>
              <span className="font-bold text-gray-700 group-hover:text-blue-700">View Messages</span>
            </button>
          </div>
        </div>

        {/* My Listings */}
        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">My Listings</h2>
            <Link to="/listings/create" className="text-orange-600 font-bold hover:text-orange-700 flex items-center gap-1">
              <FiPlus size={16} /> Add New
            </Link>
          </div>

          {listings.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FiHome size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="font-medium">No listings yet</p>
              <p className="text-sm">Create your first listing to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {listings.map((listing) => (
                <div key={listing._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                      {listing.images?.[0] ? (
                        <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <FiHome size={24} />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{listing.title}</h3>
                      <p className="text-sm text-gray-500">{listing.city}, {listing.state} • ${listing.rent}/mo</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <FiEye size={12} /> {listing.totalViews || 0} views
                        </span>
                        {listing.boost?.active && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <FiZap size={10} /> Boosted
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Boost Toggle */}
                    <button
                      onClick={() => handleBoostToggle(listing._id, listing.boost?.active)}
                      disabled={boostingId === listing._id}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${listing.boost?.active
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      {boostingId === listing._id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <FiZap size={14} />
                          {listing.boost?.active ? 'Boosted' : 'Boost'}
                        </>
                      )}
                    </button>

                    {/* Edit Button */}
                    <Link
                      to={`/listings/${listing._id}`}
                      className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <FiEdit size={18} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Boost Info */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-3xl p-8 border border-yellow-100">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-yellow-100 rounded-xl text-yellow-600">
              <FiZap size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Boost Your Listings</h3>
              <p className="text-gray-600 mb-4">
                Boosted listings appear higher in search results and get up to 3x more views.
                Boost lasts for 7 days and can be renewed anytime.
              </p>
              <p className="text-sm text-gray-500">
                💡 Tip: Listings with photos and complete details get better results when boosted.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandlordDashboard;
