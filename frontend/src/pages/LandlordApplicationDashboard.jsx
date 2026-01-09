import { useEffect, useState, useMemo } from 'react';
import applicationService from '../services/applicationService';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ModernBackground from '../components/shared/ModernBackground';
import {
    FiUsers, FiMapPin, FiCalendar, FiCheck, FiX, FiEye,
    FiMessageSquare, FiFilter, FiGrid, FiList, FiStar,
    FiChevronDown, FiMail, FiPhone, FiDollarSign, FiClock, FiHome
} from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';

const STATUS_CONFIG = {
    submitted: {
        label: 'Submitted',
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        headerColor: 'from-blue-500 to-blue-600',
        icon: '📩',
    },
    under_review: {
        label: 'Under Review',
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        headerColor: 'from-yellow-500 to-yellow-600',
        icon: '👀',
    },
    interview_scheduled: {
        label: 'Interview',
        color: 'bg-purple-100 text-purple-700 border-purple-200',
        headerColor: 'from-purple-500 to-purple-600',
        icon: '📅',
    },
    approved: {
        label: 'Approved',
        color: 'bg-green-100 text-green-700 border-green-200',
        headerColor: 'from-green-500 to-green-600',
        icon: '✅',
    },
    rejected: {
        label: 'Rejected',
        color: 'bg-red-100 text-red-700 border-red-200',
        headerColor: 'from-red-500 to-red-600',
        icon: '❌',
    },
    withdrawn: {
        label: 'Withdrawn',
        color: 'bg-gray-100 text-gray-700 border-gray-200',
        headerColor: 'from-gray-500 to-gray-600',
        icon: '↩️',
    },
};

const PIPELINE_ORDER = ['submitted', 'under_review', 'interview_scheduled', 'approved', 'rejected'];

const ApplicantCard = ({ application, onStatusChange, onCompareToggle, isSelected }) => {
    const user = application.userId;
    const listing = application.listingId;
    const config = STATUS_CONFIG[application.status];
    const [expanded, setExpanded] = useState(false);
    const [updating, setUpdating] = useState(false);

    const handleStatusChange = async (newStatus) => {
        setUpdating(true);
        await onStatusChange(application._id, newStatus);
        setUpdating(false);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    const daysSinceApplied = Math.floor((Date.now() - new Date(application.createdAt)) / (1000 * 60 * 60 * 24));

    return (
        <div className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-200 ${isSelected ? 'border-orange-400 ring-2 ring-orange-200' : 'border-gray-100 hover:shadow-md'
            }`}>
            {/* Card Header */}
            <div className="p-3 border-b border-gray-50">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        {/* Compare Checkbox */}
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => onCompareToggle(application._id)}
                            className="rounded text-orange-500 focus:ring-orange-500"
                        />

                        {/* Avatar */}
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </div>

                        <div>
                            <h3 className="font-bold text-gray-900 text-sm">
                                {user?.firstName} {user?.lastName}
                            </h3>
                            <p className="text-xs text-gray-500">
                                {user?.school} • {user?.graduationYear}
                            </p>
                        </div>
                    </div>

                    {/* Score Badge */}
                    {application.score?.total > 0 && (
                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                            <FiStar className="text-yellow-500" size={12} />
                            <span className="text-xs font-bold text-yellow-700">{application.score.total}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Card Body */}
            <div className="p-3 space-y-2">
                {/* Contact */}
                <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                        <FiMail size={10} />
                        <span className="truncate max-w-[120px]">{user?.email}</span>
                    </span>
                    <span className="flex items-center gap-1">
                        <FiPhone size={10} />
                        {user?.phone}
                    </span>
                </div>

                {/* Listing */}
                <div className="flex items-center gap-1 text-xs text-gray-500">
                    <FiHome size={10} />
                    <span className="truncate">{listing?.title}</span>
                </div>

                {/* Move-in & Lease */}
                <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-gray-600">
                        <FiCalendar size={10} />
                        {formatDate(application.moveInDate)}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600 capitalize">{application.leaseTerm?.replace('-', ' ')}</span>
                </div>

                {/* Income Info */}
                {application.applicantProfile?.income?.annualIncome && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                        <FiDollarSign size={10} />
                        <span>${application.applicantProfile.income.annualIncome.toLocaleString()}/yr</span>
                        {application.applicantProfile.income.employer && (
                            <span className="text-gray-400">@ {application.applicantProfile.income.employer}</span>
                        )}
                    </div>
                )}

                {/* Applied Date */}
                <div className="flex items-center gap-1 text-xs text-gray-400">
                    <FiClock size={10} />
                    <span>Applied {daysSinceApplied === 0 ? 'today' : `${daysSinceApplied}d ago`}</span>
                </div>

                {/* Cover Letter Preview */}
                {application.coverLetter && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700"
                    >
                        <FiMessageSquare size={10} />
                        <span>{expanded ? 'Hide' : 'View'} cover letter</span>
                        <FiChevronDown size={10} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
                    </button>
                )}

                {expanded && application.coverLetter && (
                    <div className="bg-gray-50 rounded-lg p-2 text-xs text-gray-700 max-h-24 overflow-y-auto">
                        {application.coverLetter}
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="p-3 pt-0 flex gap-2">
                {application.status === 'submitted' && (
                    <>
                        <button
                            onClick={() => handleStatusChange('under_review')}
                            disabled={updating}
                            className="flex-1 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-semibold hover:bg-yellow-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                        >
                            <FiEye size={12} />
                            Review
                        </button>
                        <button
                            onClick={() => handleStatusChange('rejected')}
                            disabled={updating}
                            className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                            <FiX size={12} />
                        </button>
                    </>
                )}

                {application.status === 'under_review' && (
                    <>
                        <button
                            onClick={() => handleStatusChange('interview_scheduled')}
                            disabled={updating}
                            className="flex-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold hover:bg-purple-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                        >
                            <FiCalendar size={12} />
                            Schedule
                        </button>
                        <button
                            onClick={() => handleStatusChange('approved')}
                            disabled={updating}
                            className="px-3 py-1.5 bg-green-100 text-green-600 rounded-lg text-xs font-semibold hover:bg-green-200 transition-colors disabled:opacity-50"
                        >
                            <FiCheck size={12} />
                        </button>
                        <button
                            onClick={() => handleStatusChange('rejected')}
                            disabled={updating}
                            className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                            <FiX size={12} />
                        </button>
                    </>
                )}

                {application.status === 'interview_scheduled' && (
                    <>
                        <button
                            onClick={() => handleStatusChange('approved')}
                            disabled={updating}
                            className="flex-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                        >
                            <FiCheck size={12} />
                            Approve
                        </button>
                        <button
                            onClick={() => handleStatusChange('rejected')}
                            disabled={updating}
                            className="flex-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                        >
                            <FiX size={12} />
                            Reject
                        </button>
                    </>
                )}

                {['approved', 'rejected'].includes(application.status) && (
                    <Link
                        to={`/messages?user=${user?._id}`}
                        className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
                    >
                        <FiMessageSquare size={12} />
                        Message
                    </Link>
                )}
            </div>
        </div>
    );
};

const KanbanColumn = ({ status, applications, onStatusChange, onCompareToggle, selectedIds }) => {
    const config = STATUS_CONFIG[status];
    const count = applications.length;

    return (
        <div className="flex-shrink-0 w-80 flex flex-col">
            {/* Column Header */}
            <div className={`bg-gradient-to-r ${config.headerColor} rounded-t-xl p-3 shadow-sm`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">{config.icon}</span>
                        <h3 className="font-bold text-white text-sm">{config.label}</h3>
                    </div>
                    <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {count}
                    </span>
                </div>
            </div>

            {/* Column Content */}
            <div className="flex-1 bg-gray-50/50 rounded-b-xl p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-380px)] min-h-[200px]">
                {applications.length > 0 ? (
                    applications.map(app => (
                        <ApplicantCard
                            key={app._id}
                            application={app}
                            onStatusChange={onStatusChange}
                            onCompareToggle={onCompareToggle}
                            isSelected={selectedIds.includes(app._id)}
                        />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                        <span className="text-2xl mb-2">{config.icon}</span>
                        <span className="text-xs">No applications</span>
                    </div>
                )}
            </div>
        </div>
    );
};

const ComparePanel = ({ applications, onClose }) => {
    if (applications.length < 2) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl p-4 z-40">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <FiUsers className="text-orange-500" size={20} />
                        <h3 className="font-bold text-gray-900">Comparing {applications.length} Applicants</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                        Close
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {applications.map(app => (
                        <div key={app._id} className="bg-gray-50 rounded-xl p-3 space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                    {app.userId?.firstName?.[0]}{app.userId?.lastName?.[0]}
                                </div>
                                <div>
                                    <div className="font-bold text-sm">{app.userId?.firstName} {app.userId?.lastName}</div>
                                    <div className="text-xs text-gray-500">{app.userId?.school}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="text-gray-400">Score</span>
                                    <div className="font-bold text-orange-600">{app.score?.total || 0}</div>
                                </div>
                                <div>
                                    <span className="text-gray-400">Income</span>
                                    <div className="font-bold">
                                        {app.applicantProfile?.income?.annualIncome
                                            ? `$${(app.applicantProfile.income.annualIncome / 1000).toFixed(0)}k`
                                            : 'N/A'}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-gray-400">Refs</span>
                                    <div className="font-bold">{app.applicantProfile?.references?.length || 0}</div>
                                </div>
                                <div>
                                    <span className="text-gray-400">Docs</span>
                                    <div className="font-bold">{app.documents?.length || 0}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const LandlordApplicationDashboard = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialListingId = queryParams.get('listingId') || '';

    const [applications, setApplications] = useState({});
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedListingId, setSelectedListingId] = useState(initialListingId);
    const [viewMode, setViewMode] = useState('kanban');
    const [selectedIds, setSelectedIds] = useState([]);

    useEffect(() => {
        fetchApplications();
    }, [selectedListingId]);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const data = await applicationService.getReceivedApplications({
                listingId: selectedListingId || null,
                grouped: true,
            });
            setApplications(data.applications);
            setListings(data.listings || []);
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (applicationId, newStatus) => {
        try {
            await applicationService.updateApplicationStatus(applicationId, { status: newStatus });
            fetchApplications();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update application status');
        }
    };

    const handleCompareToggle = (applicationId) => {
        setSelectedIds(prev =>
            prev.includes(applicationId)
                ? prev.filter(id => id !== applicationId)
                : prev.length < 4
                    ? [...prev, applicationId]
                    : prev
        );
    };

    const clearCompare = () => setSelectedIds([]);

    const selectedApplications = useMemo(() => {
        const allApps = Object.values(applications).flat();
        return allApps.filter(app => selectedIds.includes(app._id));
    }, [applications, selectedIds]);

    const totalCount = useMemo(() => {
        return Object.values(applications).flat().length;
    }, [applications]);

    const pendingCount = useMemo(() => {
        return (applications.submitted?.length || 0) + (applications.under_review?.length || 0);
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
            {/* Hero Header */}
            <div className="relative overflow-hidden pt-24 sm:pt-32 pb-10 sm:pb-16">
                <ModernBackground />

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 mb-4 sm:mb-6">
                            <FiUsers className="text-yellow-200" size={14} />
                            <span className="text-yellow-100 text-xs sm:text-sm font-bold uppercase tracking-wider">Landlord Dashboard</span>
                        </div>
                        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white mb-2 sm:mb-4 tracking-tight">
                            Applications
                        </h1>
                        <p className="text-white/80 text-sm sm:text-lg max-w-2xl mx-auto mb-4">
                            Review and manage applications for your properties.
                        </p>

                        {/* Stats */}
                        <div className="flex justify-center gap-6 mt-6">
                            <div className="text-center">
                                <div className="text-2xl sm:text-3xl font-black text-white">{totalCount}</div>
                                <div className="text-white/70 text-xs sm:text-sm">Total</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl sm:text-3xl font-black text-yellow-300">{pendingCount}</div>
                                <div className="text-white/70 text-xs sm:text-sm">Pending</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl sm:text-3xl font-black text-green-300">
                                    {applications.approved?.length || 0}
                                </div>
                                <div className="text-white/70 text-xs sm:text-sm">Approved</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
                    {/* Filters Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            {/* Listing Filter */}
                            <div className="relative">
                                <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <select
                                    value={selectedListingId}
                                    onChange={(e) => setSelectedListingId(e.target.value)}
                                    className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                >
                                    <option value="">All Listings</option>
                                    {listings.map(listing => (
                                        <option key={listing._id} value={listing._id}>{listing.title}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Compare Badge */}
                            {selectedIds.length > 0 && (
                                <div className="flex items-center gap-2 bg-orange-100 px-3 py-1.5 rounded-full">
                                    <span className="text-sm font-semibold text-orange-700">
                                        {selectedIds.length} selected
                                    </span>
                                    <button
                                        onClick={clearCompare}
                                        className="text-orange-600 hover:text-orange-800"
                                    >
                                        <FiX size={14} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* View Toggle */}
                        <div className="inline-flex rounded-lg bg-white border border-gray-200 p-0.5">
                            <button
                                onClick={() => setViewMode('kanban')}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1 ${viewMode === 'kanban'
                                    ? 'bg-orange-500 text-white'
                                    : 'text-gray-600 hover:text-orange-600'
                                    }`}
                            >
                                <FiGrid size={14} />
                                Pipeline
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1 ${viewMode === 'list'
                                    ? 'bg-orange-500 text-white'
                                    : 'text-gray-600 hover:text-orange-600'
                                    }`}
                            >
                                <FiList size={14} />
                                List
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
                                        onStatusChange={handleStatusChange}
                                        onCompareToggle={handleCompareToggle}
                                        selectedIds={selectedIds}
                                    />
                                ))}
                            </div>
                        ) : (
                            /* List View */
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.values(applications)
                                    .flat()
                                    .sort((a, b) => (b.score?.total || 0) - (a.score?.total || 0))
                                    .map(app => (
                                        <ApplicantCard
                                            key={app._id}
                                            application={app}
                                            onStatusChange={handleStatusChange}
                                            onCompareToggle={handleCompareToggle}
                                            isSelected={selectedIds.includes(app._id)}
                                        />
                                    ))}
                            </div>
                        )
                    ) : (
                        /* Empty State */
                        <div className="flex flex-col items-center justify-center py-12 sm:py-20 bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                                <FiUsers className="text-orange-500" size={28} />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No applications yet</h3>
                            <p className="text-gray-500 mb-6 sm:mb-8 max-w-md text-center text-sm sm:text-base px-4">
                                You haven't received any applications yet. Make sure your listings are active and visible.
                            </p>
                            <Link
                                to="/landlord/dashboard"
                                className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm sm:text-base"
                            >
                                <span>Manage Listings</span>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Compare Panel */}
            {selectedIds.length >= 2 && (
                <ComparePanel applications={selectedApplications} onClose={clearCompare} />
            )}
        </div>
    );
};

export default LandlordApplicationDashboard;
