import React, { useEffect, useState } from 'react';
import { FiSearch, FiUser, FiHome, FiCheckCircle, FiXCircle, FiClock, FiAlertCircle, FiCalendar } from 'react-icons/fi';
import applicationService from '../../services/applicationService';
import LoadingSpinner from '../shared/LoadingSpinner';
import ApplicantDetailPanel from './ApplicantDetailPanel';

const StatusBadge = ({ status }) => {
    const config = {
        submitted: { color: 'bg-blue-500/20 text-blue-200 border-blue-500/30', icon: FiClock, label: 'Pending' },
        under_review: { color: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30', icon: FiAlertCircle, label: 'Reviewing' },
        interview_scheduled: { color: 'bg-purple-500/20 text-purple-200 border-purple-500/30', icon: FiCalendar, label: 'Interview' },
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

const DashboardApplications = ({ initialListingId }) => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterListingId, setFilterListingId] = useState(initialListingId || 'all');
    const [listings, setListings] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedApplication, setSelectedApplication] = useState(null);

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
            // API returns { success, count, applications, listings }
            const data = await applicationService.getReceivedApplications();

            // Handle response structure - applications is an array, not grouped
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
            // Update local state
            setApplications(prev => prev.map(app =>
                app._id === applicationId ? { ...app, status: newStatus } : app
            ));
            // Close panel
            setSelectedApplication(null);
        } catch (error) {
            console.error('Error updating application status:', error);
        }
    };

    const filteredApps = applications.filter(app => {
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

    if (loading) return <LoadingSpinner />;

    return (
        <div className="bg-white/20 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/30 shadow-lg overflow-hidden">
            {/* Header / Filter Toolbar */}
            <div className="p-4 sm:p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/5">
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
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 text-white/60 text-xs uppercase tracking-wider">
                            <th className="p-4 sm:p-6 font-semibold">Applicant</th>
                            <th className="p-4 sm:p-6 font-semibold">Property Applied For</th>
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
                                // Extract applicant from userId (populated field)
                                const applicant = app.userId || {};
                                // Extract listing from listingId (populated field)
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
                                            {listing.city && (
                                                <div className="text-xs text-white/50 mt-1">
                                                    {listing.city}, {listing.state}
                                                </div>
                                            )}
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

            {/* Footer with count */}
            {applications.length > 0 && (
                <div className="p-4 border-t border-white/10 text-white/60 text-sm">
                    Showing {filteredApps.length} of {applications.length} applications
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
