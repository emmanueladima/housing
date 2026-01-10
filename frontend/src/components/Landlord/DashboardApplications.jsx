import React, { useEffect, useState, useMemo } from 'react';
import { FiSearch, FiUser, FiHome, FiCheckCircle, FiXCircle, FiClock, FiAlertCircle, FiCalendar, FiList } from 'react-icons/fi';
import { Calendar } from '@heroui/calendar';
import { parseDate, today, getLocalTimeZone } from '@internationalized/date';
import applicationService from '../../services/applicationService';
import LoadingSpinner from '../shared/LoadingSpinner';
import ApplicantDetailPanel from './ApplicantDetailPanel';

const StatusBadge = ({ status }) => {
    const config = {
        submitted: { color: 'bg-blue-500/20 text-blue-200 border-blue-500/30', icon: FiClock, label: 'Pending' },
        under_review: { color: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30', icon: FiAlertCircle, label: 'Reviewing' },
        interview_scheduled: { color: 'bg-purple-500/20 text-purple-200 border-purple-500/30', icon: FiCalendar, label: 'Tour Scheduled' },
        approved: { color: 'bg-green-500/20 text-green-200 border-green-500/30', icon: FiCheckCircle, label: 'Approved' },
        rejected: { color: 'bg-red-500/20 text-red-200 border-red-500/30', icon: FiXCircle, label: 'Rejected' },
        withdrawn: { color: 'bg-gray-500/20 text-gray-300 border-gray-500/30', icon: FiXCircle, label: 'Withdrawn' },
    };

    const style = config[status] || config['submitted'];
    const Icon = style.icon;

    return (
        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize border ${style.color}`}>
            <Icon size={12} />
            {style.label || status}
        </span>
    );
};

const STATUS_FILTERS = [
    { key: 'all', label: 'All', icon: FiList },
    { key: 'submitted', label: 'Pending', icon: FiClock },
    { key: 'interview_scheduled', label: 'Tours', icon: FiCalendar },
    { key: 'approved', label: 'Approved', icon: FiCheckCircle },
    { key: 'rejected', label: 'Rejected', icon: FiXCircle },
];

const DashboardApplications = ({ initialListingId }) => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterListingId, setFilterListingId] = useState(initialListingId || 'all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [listings, setListings] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [showCalendar, setShowCalendar] = useState(true);
    const [selectedDate, setSelectedDate] = useState(null);

    useEffect(() => {
        if (initialListingId) {
            setFilterListingId(initialListingId);
        }
    }, [initialListingId]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const data = await applicationService.getReceivedApplications();
            const appsList = data.applications || [];
            const listingsList = data.listings || [];

            setApplications(appsList);
            setListings(listingsList);
        } catch (error) {
            console.error("Error fetching applications:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (applicationId, newStatus) => {
        try {
            await applicationService.updateApplicationStatus(applicationId, { status: newStatus });
            setApplications(prev => prev.map(app =>
                app._id === applicationId ? { ...app, status: newStatus } : app
            ));
            setSelectedApplication(null);
        } catch (error) {
            console.error('Error updating application status:', error);
        }
    };

    // Get tour dates for calendar highlighting
    const tourDates = useMemo(() => {
        return applications
            .filter(app => app.tourScheduled?.date)
            .map(app => {
                const date = new Date(app.tourScheduled.date);
                return {
                    date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
                    app
                };
            });
    }, [applications]);

    // Get tours for selected date
    const toursOnSelectedDate = useMemo(() => {
        if (!selectedDate) return [];
        const dateStr = `${selectedDate.year}-${String(selectedDate.month).padStart(2, '0')}-${String(selectedDate.day).padStart(2, '0')}`;
        return tourDates.filter(t => t.date === dateStr).map(t => t.app);
    }, [selectedDate, tourDates]);

    // Status counts for pills
    const statusCounts = useMemo(() => {
        const counts = { all: applications.length };
        applications.forEach(app => {
            counts[app.status] = (counts[app.status] || 0) + 1;
        });
        return counts;
    }, [applications]);

    const filteredApps = applications.filter(app => {
        // Filter by status
        if (filterStatus !== 'all' && app.status !== filterStatus) return false;

        // Filter by listing
        if (filterListingId !== 'all') {
            const appListingId = app.listingId?._id || app.listingId;
            if (appListingId !== filterListingId) return false;
        }

        // Filter by search term
        if (searchTerm) {
            const applicant = app.userId || {};
            const fullName = `${applicant.firstName || ''} ${applicant.lastName || ''}`.toLowerCase();
            const email = (applicant.email || '').toLowerCase();
            const listingTitle = (app.listingId?.title || '').toLowerCase();
            const term = searchTerm.toLowerCase();

            if (!fullName.includes(term) && !email.includes(term) && !listingTitle.includes(term)) {
                return false;
            }
        }

        return true;
    });

    // Custom function to check if date has tours
    const isDateUnavailable = (date) => false;  // No dates blocked

    if (loading) return <LoadingSpinner />;

    return (
        <div className="flex gap-6">
            {/* Main Content */}
            <div className="flex-1 bg-white/20 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/30 shadow-lg overflow-hidden">
                {/* Header / Filter Toolbar */}
                <div className="p-4 sm:p-6 border-b border-white/10 bg-white/5">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h2 className="text-xl font-bold text-white">Application Management</h2>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
                                <input
                                    type="text"
                                    placeholder="Search applicants..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                />
                            </div>
                            <select
                                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 [&>option]:text-black"
                                value={filterListingId}
                                onChange={(e) => setFilterListingId(e.target.value)}
                            >
                                <option value="all">All Properties</option>
                                {listings.map(l => (
                                    <option key={l._id} value={l._id}>{l.title}</option>
                                ))}
                            </select>
                            <button
                                onClick={() => setShowCalendar(!showCalendar)}
                                className={`p-2 rounded-lg border transition-colors ${showCalendar ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white/10 border-white/20 text-white/60 hover:text-white'}`}
                                title="Toggle Calendar"
                            >
                                <FiCalendar size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Status Filter Pills */}
                    <div className="flex flex-wrap gap-2 mt-4">
                        {STATUS_FILTERS.map(filter => {
                            const Icon = filter.icon;
                            const count = statusCounts[filter.key] || 0;
                            const isActive = filterStatus === filter.key;

                            return (
                                <button
                                    key={filter.key}
                                    onClick={() => setFilterStatus(filter.key)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${isActive
                                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                                            : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                                        }`}
                                >
                                    <Icon size={14} />
                                    {filter.label}
                                    <span className={`px-1.5 py-0.5 rounded-full text-xs ${isActive ? 'bg-white/20' : 'bg-white/10'}`}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 text-white/60 text-xs uppercase tracking-wider">
                                <th className="p-4 sm:p-6 font-semibold">Applicant</th>
                                <th className="p-4 sm:p-6 font-semibold">Property</th>
                                <th className="p-4 sm:p-6 font-semibold">Date Applied</th>
                                <th className="p-4 sm:p-6 font-semibold">Status</th>
                                <th className="p-4 sm:p-6 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10 text-white">
                            {filteredApps.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-white/50">
                                        {applications.length === 0
                                            ? "No applications received yet."
                                            : "No applications found matching your criteria."
                                        }
                                    </td>
                                </tr>
                            ) : (
                                filteredApps.map((app) => {
                                    const applicant = app.userId || {};
                                    const listing = app.listingId || {};

                                    return (
                                        <tr key={app._id} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-4 sm:p-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white overflow-hidden shadow-lg">
                                                        {applicant.profilePicture ? (
                                                            <img src={applicant.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="font-bold text-sm">
                                                                {applicant.firstName?.[0] || '?'}{applicant.lastName?.[0] || ''}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold">
                                                            {applicant.firstName || 'Unknown'} {applicant.lastName || 'Applicant'}
                                                        </div>
                                                        <div className="text-xs text-white/60">{applicant.email || 'No email'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 sm:p-6">
                                                <div className="flex items-center gap-2">
                                                    <FiHome className="text-white/50" />
                                                    <span className="font-medium">{listing.title || 'Unknown Listing'}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 sm:p-6">
                                                <div className="text-sm">
                                                    {app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    }) : 'N/A'}
                                                </div>
                                            </td>
                                            <td className="p-4 sm:p-6">
                                                <StatusBadge status={app.status} />
                                            </td>
                                            <td className="p-4 sm:p-6 text-right">
                                                <button
                                                    onClick={() => setSelectedApplication(app)}
                                                    className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-orange-500/20"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                {applications.length > 0 && (
                    <div className="p-4 border-t border-white/10 text-white/60 text-sm">
                        Showing {filteredApps.length} of {applications.length} applications
                    </div>
                )}
            </div>

            {/* Calendar Sidebar */}
            {showCalendar && (
                <div className="hidden lg:block w-80 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 shadow-lg overflow-hidden flex-shrink-0">
                    <div className="p-4 border-b border-white/10">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <FiCalendar className="text-orange-400" />
                            Tour Schedule
                        </h3>
                        <p className="text-white/60 text-xs mt-1">
                            {tourDates.length} tours scheduled
                        </p>
                    </div>

                    {/* Calendar */}
                    <div className="p-4 flex justify-center [&_.calendar]:bg-transparent [&_button]:text-white [&_th]:text-white/60 [&_td]:text-white">
                        <Calendar
                            aria-label="Tour dates"
                            value={selectedDate}
                            onChange={setSelectedDate}
                            minValue={today(getLocalTimeZone())}
                            classNames={{
                                base: "bg-transparent",
                                headerWrapper: "bg-transparent",
                                gridWrapper: "bg-transparent",
                                grid: "bg-transparent",
                                cell: "data-[selected=true]:bg-orange-500 data-[selected=true]:text-white",
                                cellButton: "data-[selected=true]:bg-orange-500 data-[selected=true]:text-white hover:bg-white/20",
                            }}
                        />
                    </div>

                    {/* Tours on Selected Date */}
                    {selectedDate && (
                        <div className="p-4 border-t border-white/10">
                            <h4 className="text-white/60 text-xs uppercase tracking-wider mb-3">
                                Tours on {selectedDate.month}/{selectedDate.day}/{selectedDate.year}
                            </h4>
                            {toursOnSelectedDate.length === 0 ? (
                                <p className="text-white/50 text-sm">No tours scheduled</p>
                            ) : (
                                <div className="space-y-2">
                                    {toursOnSelectedDate.map(app => (
                                        <button
                                            key={app._id}
                                            onClick={() => setSelectedApplication(app)}
                                            className="w-full p-3 bg-white/10 rounded-xl text-left hover:bg-white/20 transition-colors"
                                        >
                                            <div className="text-white font-medium text-sm">
                                                {app.userId?.firstName} {app.userId?.lastName}
                                            </div>
                                            <div className="text-white/60 text-xs">
                                                {app.listingId?.title}
                                            </div>
                                            {app.tourScheduled?.time && (
                                                <div className="text-orange-400 text-xs mt-1">
                                                    {app.tourScheduled.time}
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Upcoming Tours List */}
                    <div className="p-4 border-t border-white/10">
                        <h4 className="text-white/60 text-xs uppercase tracking-wider mb-3">Upcoming Tours</h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {tourDates.length === 0 ? (
                                <p className="text-white/50 text-sm">No upcoming tours</p>
                            ) : (
                                tourDates.slice(0, 5).map(({ date, app }) => (
                                    <button
                                        key={app._id}
                                        onClick={() => setSelectedApplication(app)}
                                        className="w-full p-3 bg-purple-500/20 border border-purple-500/30 rounded-xl text-left hover:bg-purple-500/30 transition-colors"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="text-white font-medium text-sm">
                                                    {app.userId?.firstName} {app.userId?.lastName}
                                                </div>
                                                <div className="text-white/60 text-xs">
                                                    {app.listingId?.title}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-purple-300 text-xs font-medium">
                                                    {new Date(app.tourScheduled.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </div>
                                                {app.tourScheduled?.time && (
                                                    <div className="text-white/50 text-xs">
                                                        {app.tourScheduled.time}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Applicant Detail Panel */}
            {selectedApplication && (
                <ApplicantDetailPanel
                    application={selectedApplication}
                    onClose={() => setSelectedApplication(null)}
                    onStatusUpdate={handleStatusUpdate}
                />
            )}
        </div>
    );
};

export default DashboardApplications;
