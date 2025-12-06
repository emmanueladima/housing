import React, { useState, useEffect } from 'react';
import { FiHome, FiMessageSquare, FiTrendingUp, FiPlus, FiEdit, FiEye } from 'react-icons/fi';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import ModernBackground from '../components/shared/ModernBackground';
import LoadingSpinner from '../components/shared/LoadingSpinner';

const MetricCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3 sm:gap-4">
    <div className={`p-3 sm:p-4 rounded-lg sm:rounded-xl ${color}`}>
      <Icon size={20} className="text-white sm:w-6 sm:h-6" />
    </div>
    <div>
      <p className="text-gray-500 text-xs sm:text-sm font-medium">{label}</p>
      <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{value}</h3>
    </div>
  </div>
);

const LandlordDashboard = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="relative h-36 sm:h-48 overflow-hidden mb-6 sm:mb-8">
        <ModernBackground />
        <div className="absolute inset-0 flex items-end sm:items-center justify-center pb-4 sm:pb-0">
          <h1 className="text-xl sm:text-3xl font-black text-white">Landlord Dashboard</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-8 sm:-mt-12 space-y-6 sm:space-y-8 relative z-10">
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
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-lg">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <button
              onClick={() => navigate('/listings/create')}
              className="p-4 sm:p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all flex flex-col items-center justify-center gap-2 sm:gap-3 group"
            >
              <div className="p-2 sm:p-3 bg-orange-100 rounded-full text-orange-600 group-hover:scale-110 transition-transform">
                <FiPlus size={20} />
              </div>
              <span className="font-bold text-gray-700 group-hover:text-orange-700 text-xs sm:text-base text-center">Post Listing</span>
            </button>

            <button
              onClick={() => navigate('/messages')}
              className="p-4 sm:p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center justify-center gap-2 sm:gap-3 group"
            >
              <div className="p-2 sm:p-3 bg-blue-100 rounded-full text-blue-600 group-hover:scale-110 transition-transform">
                <FiMessageSquare size={20} />
              </div>
              <span className="font-bold text-gray-700 group-hover:text-blue-700 text-xs sm:text-base text-center">Messages</span>
            </button>
          </div>
        </div>

        {/* My Listings */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-lg">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">My Listings</h2>
            <Link to="/listings/create" className="text-orange-600 font-bold hover:text-orange-700 flex items-center gap-1 text-sm">
              <FiPlus size={14} />
              <span className="hidden sm:inline">Add New</span>
              <span className="sm:hidden">Add</span>
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
                <div key={listing._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors gap-3">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                      {listing.images?.[0] ? (
                        <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <FiHome size={20} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">{listing.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">{listing.city}, {listing.state} • ${listing.rent}/mo</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <FiEye size={10} />
                          {listing.totalViews || 0}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${listing.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {listing.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Link
                      to={`/listings/${listing._id}`}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors font-medium text-xs sm:text-sm"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => navigate(`/listings/edit/${listing._id}`)}
                      className="p-1.5 sm:p-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors"
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
    </div>
  );
};

export default LandlordDashboard;
