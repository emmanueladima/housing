import { useState, useEffect } from 'react';
import { FiSearch, FiTrash2, FiExternalLink, FiMapPin, FiHome, FiCheck, FiX } from 'react-icons/fi';
import adminService from '../../services/adminService';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { toast } from 'react-hot-toast';

const ListingManagement = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [processingId, setProcessingId] = useState(null);

    const fetchListings = async () => {
        try {
            setLoading(true);
            const data = await adminService.getListings(page, 10, search, statusFilter);
            setListings(data.listings);
            setTotalPages(data.pagination.pages);
        } catch (error) {
            toast.error('Failed to load listings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchListings();
        }, 500); // Debounce search
        return () => clearTimeout(timer);
    }, [search, statusFilter, page]);

    const handleDelete = async (listing) => {
        if (!confirm(`Are you sure you want to delete listing "${listing.title}"? This cannot be undone.`)) return;

        try {
            setProcessingId(listing._id);
            await adminService.deleteListing(listing._id);

            // Update local state
            setListings(listings.filter(l => l._id !== listing._id));
            toast.success('Listing deleted successfully');
        } catch (error) {
            toast.error(error);
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Listing Management
                </h1>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-orange-500"
                    >
                        <option value="all" className="bg-gray-900">All Status</option>
                        <option value="active" className="bg-gray-900">Active</option>
                        <option value="disabled" className="bg-gray-900">Disabled</option>
                    </select>

                    {/* Search Bar */}
                    <div className="relative flex-1 sm:w-64">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search title, city..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:border-orange-500"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10 text-gray-400 text-sm">
                                <th className="p-4 font-medium">Property</th>
                                <th className="p-4 font-medium">Landlord</th>
                                <th className="p-4 font-medium">Rent/Type</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center">
                                        <LoadingSpinner />
                                    </td>
                                </tr>
                            ) : listings.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-400">
                                        No listings found matching "{search}"
                                    </td>
                                </tr>
                            ) : (
                                listings.map((listing) => (
                                    <tr key={listing._id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-700 shrink-0">
                                                    {listing.images?.[0] ? (
                                                        <img
                                                            src={listing.images[0]}
                                                            alt={listing.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                            <FiHome />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white truncate max-w-[200px]" title={listing.title}>
                                                        {listing.title}
                                                    </p>
                                                    <div className="flex items-center gap-1 text-sm text-gray-400 mt-1">
                                                        <FiMapPin className="shrink-0" size={12} />
                                                        <span className="truncate max-w-[180px]">{listing.city}, {listing.state}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {listing.landlord ? (
                                                <div>
                                                    <p className="text-sm text-gray-200">{listing.landlord.firstName} {listing.landlord.lastName}</p>
                                                    <p className="text-xs text-gray-500">{listing.landlord.email}</p>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-500 italic">Unknown</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <p className="font-semibold text-white">${listing.rent.toLocaleString()}</p>
                                            <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-gray-300">
                                                {listing.propertyType || 'Apartment'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {listing.isActive ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                                    <FiCheck size={12} /> Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30">
                                                    <FiX size={12} /> Disabled
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex justify-end gap-2">
                                                <a
                                                    href={`/listings/${listing._id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                    title="View Public Page"
                                                >
                                                    <FiExternalLink />
                                                </a>
                                                <button
                                                    onClick={() => handleDelete(listing)}
                                                    disabled={processingId === listing._id}
                                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Delete Listing"
                                                >
                                                    {processingId === listing._id ? <LoadingSpinner size="sm" /> : <FiTrash2 />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-white/10 flex justify-between items-center text-sm text-gray-400">
                    <span>Page {page} of {totalPages}</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1 bg-white/5 rounded-lg hover:bg-white/10 disabled:opacity-50 transition-colors"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-3 py-1 bg-white/5 rounded-lg hover:bg-white/10 disabled:opacity-50 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListingManagement;
