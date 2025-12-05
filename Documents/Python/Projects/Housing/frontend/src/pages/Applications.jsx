import { useEffect, useState } from 'react';
import applicationService from '../services/applicationService';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import Badge from '../components/shared/Badge';
import ModernBackground from '../components/shared/ModernBackground';
import { FiFileText, FiMapPin, FiCalendar, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const data = await applicationService.getMyApplications();
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

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
              <FiFileText className="text-yellow-200" size={16} />
              <span className="text-yellow-100 text-sm font-bold uppercase tracking-wider">Track Your Progress</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              My Applications
            </h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Track the status of your housing applications in one place.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((app) => (
                <div key={app._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-gray-900 mb-2">{app.listingId?.title}</h3>
                      <div className="flex items-center gap-4 text-gray-600 text-sm">
                        <span className="flex items-center gap-1">
                          <FiMapPin size={14} />
                          {app.listingId?.city}, {app.listingId?.state}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiCalendar size={14} />
                          {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-4 py-2 rounded-full text-sm font-bold ${app.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : app.status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                      <Link
                        to={`/listings/${app.listingId?._id}`}
                        className="px-4 py-2 text-orange-600 font-bold hover:bg-orange-50 rounded-full transition-colors"
                      >
                        View Listing
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center mb-6">
                <FiFileText className="text-orange-500" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No applications yet</h3>
              <p className="text-gray-500 mb-8 max-w-md text-center">
                You haven't submitted any applications yet. Start exploring listings to find your perfect place.
              </p>
              <Link
                to="/listings"
                className="inline-flex items-center gap-2 px-8 py-3 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <span>Browse Listings</span>
                <FiArrowRight />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Applications;
