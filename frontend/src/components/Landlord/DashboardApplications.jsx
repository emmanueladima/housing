import React, { useEffect, useState } from 'react';
import { FiSearch, FiFilter, FiUser, FiHome, FiCheckCircle, FiXCircle, FiClock, FiAlertCircle } from 'react-icons/fi';
import applicationService from '../../services/applicationService';
import LoadingSpinner from '../shared/LoadingSpinner';

const StatusBadge = ({ status }) => {
    const config = {
        submitted: { color: 'bg-blue-500/20 text-blue-200', icon: FiClock, label: 'Pending' },
        'under review': { color: 'bg-yellow-500/20 text-yellow-200', icon: FiAlertCircle, label: 'Reviewing' },
        interview: { color: 'bg-purple-500/20 text-purple-200', icon: FiUsersLink, label: 'Interview' }, // FiUsersLink not imported
        approved: { color: 'bg-green-500/20 text-green-200', icon: FiCheckCircle, label: 'Approved' },
        rejected: { color: 'bg-red-500/20 text-red-200', icon: FiXCircle, label: 'Rejected' },
    };

    const style = config[status.toLowerCase()] || config['submitted'];
    const Icon = style.icon;

    return (
        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize ${style.color}`}>
            <Icon size={12} />
            {style.label || status}
        </span>
    );
};

// Quick fix for missing icon
const FiUsersLink = () => <FiUser />;

const DashboardApplications = ({ initialListingId }) => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterListingId, setFilterListingId] = useState(initialListingId || 'all');
    const [listings, setListings] = useState([]); // To populate filter dropdown

    useEffect(() => {
        fetchData();
    }, [initialListingId]);

    const fetchData = async () => {
        try {
            const data = await applicationService.getReceivedApplications();
            // Flatten the grouped object into a single array
            const flatList = [];
            Object.entries(data).forEach(([status, apps]) => {
                if (Array.isArray(apps)) {
                    apps.forEach(app => {
                        // Ensure listing info is attached
                        flatList.push({ ...app, currentStatus: status });
                    });
                }
            });

            // Extract unique listings for filter
            const seenListings = new Set();
            const uniqueListings = [];
            flatList.forEach(app => {
                if (app.listing && !seenListings.has(app.listing._id)) {
                    seenListings.add(app.listing._id);
                    uniqueListings.push(app.listing);
                }
            });
            setListings(uniqueListings);
            setApplications(flatList);
        } catch (error) {
            console.error("Error fetching applications:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredApps = applications.filter(app => {
        if (filterListingId !== 'all' && app.listing?._id !== filterListingId) return false;
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
                            className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                        />
                    </div>
                    {/* Listing Filter - Simple */}
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
                            <th className="p-4 sm:p-6 font-semibold">Financials</th>
                            <th className="p-4 sm:p-6 font-semibold">Status</th>
                            <th className="p-4 sm:p-6 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 text-white">
                        {filteredApps.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-white/50">
                                    No applications found matching your criteria.
                                </td>
                            </tr>
                        ) : (
                            filteredApps.map((app) => (
                                <tr key={app._id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-4 sm:p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white overflow-hidden">
                                                {app.applicant?.profilePicture ? (
                                                    <img src={app.applicant.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="font-bold text-sm">
                                                        {app.applicant?.firstName?.[0]}{app.applicant?.lastName?.[0]}
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold">{app.applicant?.firstName} {app.applicant?.lastName}</div>
                                                <div className="text-xs text-white/60">{app.applicant?.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 sm:p-6">
                                        <div className="flex items-center gap-2">
                                            <FiHome className="text-white/50" />
                                            <span className="font-medium">{app.listing?.title || 'Unknown Listing'}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 sm:p-6">
                                        {/* Mock Data for now as backend might not serve it flat yet */}
                                        <div className="text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="text-white/70">Credit:</span>
                                                <span className={`font-bold ${Math.random() > 0.5 ? 'text-green-300' : 'text-yellow-300'}`}>
                                                    {app.applicant?.creditScore || '720'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-white/70">Income:</span>
                                                <span className="font-medium">{app.applicant?.income ? `$${app.applicant.income}/yr` : '$85k/yr'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 sm:p-6">
                                        <StatusBadge status={app.currentStatus} />
                                    </td>
                                    <td className="p-4 sm:p-6 text-right">
                                        <button className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DashboardApplications;
