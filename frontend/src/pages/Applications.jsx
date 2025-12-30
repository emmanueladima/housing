import { useEffect, useState, useMemo } from 'react';
import applicationService from '../services/applicationService';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import {
  FiFileText, FiMapPin, FiCalendar, FiArrowRight, FiClock,
  FiCheckCircle, FiXCircle, FiEye, FiMessageSquare, FiChevronDown,
  FiHome, FiDollarSign
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { Card, CardBody } from '@heroui/card';

const STATUS_CONFIG = {
  submitted: {
    label: 'Submitted',
    color: 'bg-blue-500/20 text-blue-100 border-blue-500/30',
    bg: 'bg-blue-500/5 border-blue-500/10',
    icon: FiFileText,
    headerColor: 'bg-blue-500/20 backdrop-blur-md',
    description: 'Awaiting landlord review',
  },
  under_review: {
    label: 'Under Review',
    color: 'bg-yellow-500/20 text-yellow-100 border-yellow-500/30',
    bg: 'bg-yellow-500/5 border-yellow-500/10',
    icon: FiEye,
    headerColor: 'bg-yellow-500/20 backdrop-blur-md',
    description: 'Landlord is reviewing your application',
  },
  interview_scheduled: {
    label: 'Interview Scheduled',
    color: 'bg-purple-500/20 text-purple-100 border-purple-500/30',
    bg: 'bg-purple-500/5 border-purple-500/10',
    icon: FiCalendar,
    headerColor: 'bg-purple-500/20 backdrop-blur-md',
    description: 'Property viewing or interview scheduled',
  },
  approved: {
    label: 'Approved',
    color: 'bg-green-500/20 text-green-100 border-green-500/30',
    bg: 'bg-green-500/5 border-green-500/10',
    icon: FiCheckCircle,
    headerColor: 'bg-green-500/20 backdrop-blur-md',
    description: 'Congratulations! Your application was approved',
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-500/20 text-red-100 border-red-500/30',
    bg: 'bg-red-500/5 border-red-500/10',
    icon: FiXCircle,
    headerColor: 'bg-red-500/20 backdrop-blur-md',
    description: 'Application was not accepted',
  },
  withdrawn: {
    label: 'Withdrawn',
    color: 'bg-gray-500/20 text-gray-100 border-gray-500/30',
    bg: 'bg-gray-500/5 border-gray-500/10',
    icon: FiXCircle,
    headerColor: 'bg-gray-500/20 backdrop-blur-md',
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
    <Card isBlurred className="border border-white/30 bg-white/20 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-200 rounded-[2rem] overflow-hidden">
      {/* Listing Image */}
      {listing?.images?.[0] && (
        <div className="relative h-32 overflow-hidden">
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="font-bold text-white text-base truncate drop-shadow-md">{listing?.title}</h3>
            <div className="flex items-center text-white/90 text-xs mt-0.5 drop-shadow-sm">
              <FiMapPin size={10} className="mr-1" />
              <span className="truncate">{listing?.city}, {listing?.state}</span>
            </div>
          </div>
        </div>
      )}

      {/* Card Content */}
      <CardBody className="p-4">
        {!listing?.images?.[0] && (
          <h3 className="font-bold text-white text-base truncate mb-1">{listing?.title}</h3>
        )}

        {/* Price & Status Row */}
        <div className="flex items-center justify-between mb-3">
          <span className="flex items-center gap-1 font-black text-white text-lg">
            <span className="text-yellow-200 text-sm">$</span>
            {listing?.rent?.toLocaleString()}
            <span className="text-white/60 text-xs font-normal">/mo</span>
          </span>
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${config?.color} border bg-opacity-50 backdrop-blur-sm`}>
            <StatusIcon size={10} />
            {config?.label}
          </div>
        </div>

        {/* Timeline */}
        <div className="flex items-center gap-1 text-xs text-white/60 mb-3 font-medium">
          <FiClock size={12} className="text-yellow-200" />
          <span>Applied {daysSince === 0 ? 'today' : `${daysSince}d ago`}</span>
        </div>

        {/* Tour Info */}
        {application.tourScheduled?.date && (
          <div className="bg-purple-500/20 rounded-xl p-3 mb-3 border border-purple-500/30 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs text-purple-200 font-bold">
              <FiCalendar size={12} />
              <span>Tour: {formatDate(application.tourScheduled.date)}</span>
              {application.tourScheduled.confirmed && (
                <span className="ml-auto text-green-200 bg-green-500/20 px-2 py-0.5 rounded-full text-[10px]">Confirmed</span>
              )}
            </div>
          </div>
        )}

        {/* Landlord Response */}
        {application.landlordResponse?.message && (
          <div className="bg-white/10 rounded-xl p-3 mb-3 border border-white/20 backdrop-blur-sm">
            <div className="flex items-center gap-1.5 text-xs text-white/80 mb-1 font-bold uppercase tracking-wide">
              <FiMessageSquare size={10} />
              <span>Landlord Response</span>
            </div>
            <p className="text-xs text-white/70 italic line-clamp-2 pl-4 border-l-2 border-yellow-200/50">"{application.landlordResponse.message}"</p>
          </div>
        )}

        {/* Expandable Details */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-1 text-xs font-bold text-white/50 hover:text-white transition-colors w-full justify-center py-2 group"
        >
          <span>{showDetails ? 'Hide Details' : 'View Details'}</span>
          <FiChevronDown size={14} className={`transition-transform duration-300 ${showDetails ? 'rotate-180' : 'group-hover:translate-y-0.5'}`} />
        </button>

        {showDetails && (
          <div className="mt-1 pt-3 border-t border-white/20 space-y-2 text-xs animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex justify-between items-center bg-white/10 p-2 rounded-lg">
              <span className="text-white/60 font-medium">Move-in Date</span>
              <span className="font-bold text-white">{formatDate(application.moveInDate)}</span>
            </div>
            <div className="flex justify-between items-center bg-white/10 p-2 rounded-lg">
              <span className="text-white/60 font-medium">Lease Term</span>
              <span className="font-bold text-white capitalize">{application.leaseTerm?.replace('-', ' ')}</span>
            </div>
            {application.coverLetter && (
              <div className="bg-white/10 p-2 rounded-lg">
                <span className="text-white/60 font-medium block mb-1">Cover Letter</span>
                <p className="text-white/70 italic line-clamp-3 pl-2 border-l-2 border-white/30">{application.coverLetter}</p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-4 pt-3 border-t border-white/20">
          <Link
            to={`/listings/${listing?._id}`}
            className="flex-1 px-4 py-2 text-xs font-bold text-center text-white bg-white/20 hover:bg-white/30 rounded-xl transition-all shadow-md hover:shadow-lg transform active:scale-95"
          >
            View Listing
          </Link>
          {['submitted', 'under_review'].includes(application.status) && (
            <button
              onClick={() => onWithdraw(application._id)}
              className="px-4 py-2 text-xs font-bold text-red-200 hover:text-red-100 hover:bg-red-500/20 rounded-xl transition-colors border border-red-500/30"
            >
              Withdraw
            </button>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

const KanbanColumn = ({ status, applications, onWithdraw }) => {
  const config = STATUS_CONFIG[status];
  const count = applications.length;

  return (
    <div className="flex-shrink-0 w-80 h-full max-h-[calc(100vh-240px)] flex flex-col">
      <Card isBlurred className={`flex-1 flex flex-col border ${config.bg} backdrop-blur-xl shadow-lg rounded-[2rem] overflow-hidden`}>
        {/* Column Header */}
        <div className={`${config.headerColor} p-4 shadow-sm flex-shrink-0 border-b border-white/10`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                <config.icon className="text-white" size={16} />
              </div>
              <h3 className="font-bold text-white text-base">{config.label}</h3>
            </div>
            <span className="bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-md border border-white/10">
              {count}
            </span>
          </div>
          <p className="text-white/90 text-xs leading-relaxed font-medium opacity-90">{config.description}</p>
        </div>

        {/* Column Content */}
        <div className="flex-1 p-3 space-y-3 overflow-y-auto">
          {applications.length > 0 ? (
            applications.map(app => (
              <ApplicationCard key={app._id} application={app} onWithdraw={onWithdraw} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <div className={`p-4 rounded-full ${config.bg} mb-3`}>
                <config.icon size={24} className="opacity-40" />
              </div>
              <span className="text-xs font-medium opacity-60">No applications</span>
            </div>
          )}
        </div>
      </Card>
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
    <div className="min-h-screen relative pb-24">
      {/* Header */}
      <div className="relative pt-32 pb-8">
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
      <div className="relative z-10 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          {/* View Toggle */}
          <div className="flex justify-end mb-4">
            <div className="inline-flex rounded-lg bg-white/10 border border-white/20 p-0.5 backdrop-blur-md">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${viewMode === 'kanban'
                  ? 'bg-white text-gray-900 shadow-sm shadow-black/10'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
              >
                Pipeline View
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm shadow-black/10'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
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
            <div className="flex flex-col items-center justify-center py-12 sm:py-20 bg-white/20 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/30 shadow-lg">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                <FiFileText className="text-white" size={28} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">No applications yet</h3>
              <p className="text-white/70 mb-6 sm:mb-8 max-w-md text-center text-sm sm:text-base px-4">
                You haven't submitted any applications yet. Start exploring listings to find your perfect place.
              </p>
              <Link
                to="/listings"
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-white text-gray-900 rounded-full font-bold hover:bg-white/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm sm:text-base"
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
