import { useEffect, useState, useMemo } from 'react';
import applicationService from '../services/applicationService';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ModernBackground from '../components/shared/ModernBackground';
import {
  FiFileText, FiMapPin, FiCalendar, FiArrowRight, FiClock,
  FiCheckCircle, FiXCircle, FiEye, FiMessageSquare, FiChevronDown,
  FiHome, FiDollarSign
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

const STATUS_CONFIG = {
  submitted: {
    label: 'Submitted',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: FiFileText,
    headerColor: 'from-blue-500 to-blue-600',
    description: 'Awaiting landlord review',
  },
  under_review: {
    label: 'Under Review',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: FiEye,
    headerColor: 'from-yellow-500 to-yellow-600',
    description: 'Landlord is reviewing your application',
  },
  interview_scheduled: {
    label: 'Interview Scheduled',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: FiCalendar,
    headerColor: 'from-purple-500 to-purple-600',
    description: 'Property viewing or interview scheduled',
  },
  approved: {
    label: 'Approved',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: FiCheckCircle,
    headerColor: 'from-green-500 to-green-600',
    description: 'Congratulations! Your application was approved',
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: FiXCircle,
    headerColor: 'from-red-500 to-red-600',
    description: 'Application was not accepted',
  },
  withdrawn: {
    label: 'Withdrawn',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: FiXCircle,
    headerColor: 'from-gray-500 to-gray-600',
    description: 'You withdrew this application',
  },
};

const PIPELINE_ORDER = ['submitted', 'under_review', 'interview_scheduled', 'approved', 'rejected'];

const ApplicationCard = ({ application, onWithdraw }) => {
  const listing = application.listingId;
  const config = STATUS_CONFIG[application.status];
  const StatusIcon = config?.icon || FiFileText;
  const [showDetails, setShowDetails] = useState(false);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const daysSince = Math.floor((Date.now() - new Date(application.createdAt)) / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200">
      {/* Listing Image */}
      {listing?.images?.[0] && (
        <div className="relative h-28 overflow-hidden">
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-2 left-2 right-2">
            <h3 className="font-bold text-white text-sm truncate">{listing?.title}</h3>
          </div>
        </div>
      )}

      {/* Card Content */}
      <div className="p-3">
        {!listing?.images?.[0] && (
          <h3 className="font-bold text-gray-900 text-sm truncate mb-2">{listing?.title}</h3>
        )}

        {/* Location & Price */}
        <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
          <span className="flex items-center gap-1 truncate">
            <FiMapPin size={10} className="shrink-0" />
            <span className="truncate">{listing?.city}, {listing?.state}</span>
          </span>
          <span className="flex items-center gap-1 font-bold text-gray-900">
            <FiDollarSign size={10} />
            {listing?.rent?.toLocaleString()}/mo
          </span>
        </div>

        {/* Status Badge */}
        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${config?.color} border mb-2`}>
          <StatusIcon size={12} />
          {config?.label}
        </div>

        {/* Timeline */}
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
          <FiClock size={10} />
          <span>Applied {daysSince === 0 ? 'today' : `${daysSince}d ago`}</span>
        </div>

        {/* Tour Info */}
        {application.tourScheduled?.date && (
          <div className="bg-purple-50 rounded-lg p-2 mb-2 border border-purple-100">
            <div className="flex items-center gap-1 text-xs text-purple-700 font-medium">
              <FiCalendar size={10} />
              <span>Tour: {formatDate(application.tourScheduled.date)}</span>
              {application.tourScheduled.confirmed && (
                <span className="ml-auto text-green-600">✓ Confirmed</span>
              )}
            </div>
          </div>
        )}

        {/* Landlord Response */}
        {application.landlordResponse?.message && (
          <div className="bg-gray-50 rounded-lg p-2 mb-2 border border-gray-100">
            <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
              <FiMessageSquare size={10} />
              <span className="font-medium">Landlord Response</span>
            </div>
            <p className="text-xs text-gray-700 line-clamp-2">{application.landlordResponse.message}</p>
          </div>
        )}

        {/* Expandable Details */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-orange-600 transition-colors w-full justify-center py-1"
        >
          <span>{showDetails ? 'Less' : 'More'} details</span>
          <FiChevronDown size={12} className={`transition-transform ${showDetails ? 'rotate-180' : ''}`} />
        </button>

        {showDetails && (
          <div className="mt-2 pt-2 border-t border-gray-100 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Move-in Date:</span>
              <span className="font-medium">{formatDate(application.moveInDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Lease Term:</span>
              <span className="font-medium capitalize">{application.leaseTerm?.replace('-', ' ')}</span>
            </div>
            {application.coverLetter && (
              <div>
                <span className="text-gray-500 block mb-1">Cover Letter:</span>
                <p className="text-gray-700 bg-gray-50 rounded p-2 line-clamp-3">{application.coverLetter}</p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-3 pt-2 border-t border-gray-100">
          <Link
            to={`/listings/${listing?._id}`}
            className="flex-1 px-3 py-1.5 text-xs font-semibold text-center text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
          >
            View Listing
          </Link>
          {['submitted', 'under_review'].includes(application.status) && (
            <button
              onClick={() => onWithdraw(application._id)}
              className="px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Withdraw
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const KanbanColumn = ({ status, applications, onWithdraw }) => {
  const config = STATUS_CONFIG[status];
  const count = applications.length;

  return (
    <div className="flex-shrink-0 w-72 flex flex-col">
      {/* Column Header */}
      <div className={`bg-gradient-to-r ${config.headerColor} rounded-t-xl p-3 shadow-sm`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <config.icon className="text-white" size={16} />
            <h3 className="font-bold text-white text-sm">{config.label}</h3>
          </div>
          <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {count}
          </span>
        </div>
        <p className="text-white/80 text-xs mt-1">{config.description}</p>
      </div>

      {/* Column Content */}
      <div className="flex-1 bg-gray-50/50 rounded-b-xl p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-340px)] min-h-[200px]">
        {applications.length > 0 ? (
          applications.map(app => (
            <ApplicationCard key={app._id} application={app} onWithdraw={onWithdraw} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
            <config.icon size={24} className="mb-2 opacity-50" />
            <span className="text-xs">No applications</span>
          </div>
        )}
      </div>
    </div>
  );
};

const Applications = () => {
  const [applications, setApplications] = useState({});
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'
  const [withdrawingId, setWithdrawingId] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await applicationService.getMyApplications(true);
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (applicationId) => {
    if (!confirm('Are you sure you want to withdraw this application?')) return;

    try {
      setWithdrawingId(applicationId);
      await applicationService.withdrawApplication(applicationId);
      fetchApplications(); // Refresh
    } catch (error) {
      console.error('Error withdrawing application:', error);
      alert('Failed to withdraw application');
    } finally {
      setWithdrawingId(null);
    }
  };

  const totalCount = useMemo(() => {
    return Object.values(applications).flat().length;
  }, [applications]);

  const activeCount = useMemo(() => {
    return (applications.submitted?.length || 0) +
      (applications.under_review?.length || 0) +
      (applications.interview_scheduled?.length || 0);
  }, [applications]);

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
      <div className="relative overflow-hidden pt-24 sm:pt-32 pb-10 sm:pb-16">
        <ModernBackground />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 mb-4 sm:mb-6">
              <FiFileText className="text-yellow-200" size={14} />
              <span className="text-yellow-100 text-xs sm:text-sm font-bold uppercase tracking-wider">Track Your Progress</span>
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white mb-2 sm:mb-4 tracking-tight">
              My Applications
            </h1>
            <p className="text-white/80 text-sm sm:text-lg max-w-2xl mx-auto mb-4">
              Track the status of your housing applications in one place.
            </p>

            {/* Stats */}
            <div className="flex justify-center gap-6 mt-6">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-white">{totalCount}</div>
                <div className="text-white/70 text-xs sm:text-sm">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-green-300">{activeCount}</div>
                <div className="text-white/70 text-xs sm:text-sm">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-yellow-300">
                  {applications.approved?.length || 0}
                </div>
                <div className="text-white/70 text-xs sm:text-sm">Approved</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          {/* View Toggle */}
          <div className="flex justify-end mb-4">
            <div className="inline-flex rounded-lg bg-white border border-gray-200 p-0.5">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'kanban'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-600 hover:text-orange-600'
                  }`}
              >
                Pipeline View
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'list'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-600 hover:text-orange-600'
                  }`}
              >
                List View
              </button>
            </div>
          </div>

          {totalCount > 0 ? (
            viewMode === 'kanban' ? (
              /* Kanban View */
              <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
                {PIPELINE_ORDER.map(status => (
                  <KanbanColumn
                    key={status}
                    status={status}
                    applications={applications[status] || []}
                    onWithdraw={handleWithdraw}
                  />
                ))}
              </div>
            ) : (
              /* List View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.values(applications)
                  .flat()
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map(app => (
                    <ApplicationCard key={app._id} application={app} onWithdraw={handleWithdraw} />
                  ))}
              </div>
            )
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-12 sm:py-20 bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                <FiFileText className="text-orange-500" size={28} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No applications yet</h3>
              <p className="text-gray-500 mb-6 sm:mb-8 max-w-md text-center text-sm sm:text-base px-4">
                You haven't submitted any applications yet. Start exploring listings to find your perfect place.
              </p>
              <Link
                to="/listings"
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm sm:text-base"
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
