import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiHome, FiEye, FiUsers, FiEdit } from 'react-icons/fi';

const DashboardListings = ({ listings = [], onPreview, switchToApps }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-white/20 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-white/30 shadow-lg">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-white">My Listings</h2>
                <Link to="/listings/create" className="text-yellow-200 font-bold hover:text-white flex items-center gap-1 text-sm bg-white/10 px-3 py-2 rounded-lg transition-colors">
                    <FiPlus size={16} />
                    <span className="hidden sm:inline">Add New Property</span>
                    <span className="sm:hidden">Add</span>
                </Link>
            </div>

            {listings.length === 0 ? (
                <div className="text-center py-12 text-white/60">
                    <FiHome size={48} className="mx-auto mb-4 text-white/30" />
                    <p className="font-medium">No listings yet</p>
                    <p className="text-sm">Create your first listing to get started</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {listings.map((listing) => (
                        <div key={listing._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-colors gap-3 group">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-lg bg-white/20 overflow-hidden flex-shrink-0 relative">
                                    {listing.images?.[0] ? (
                                        <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white/50">
                                            <FiHome size={20} />
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-bold text-white text-sm sm:text-lg truncate group-hover:text-yellow-200 transition-colors">{listing.title}</h3>
                                    <p className="text-xs sm:text-sm text-white/70 truncate">{listing.city}, {listing.state} • ${listing.rent}/mo</p>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="text-xs text-white/60 flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full">
                                            <FiEye size={12} />
                                            {listing.totalViews || 0} views
                                        </span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${listing.isActive ? 'bg-green-500/30 text-green-200 border border-green-500/30' : 'bg-white/10 text-white/60 border border-white/10'}`}>
                                            {listing.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                        {listing.totalApplications > 0 && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/30 text-orange-200 border border-orange-500/30 flex items-center gap-1">
                                                <FiUsers size={12} />
                                                {listing.totalApplications} Apps
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-center">
                                <button
                                    onClick={() => switchToApps(listing._id)}
                                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 font-medium text-xs sm:text-sm flex items-center gap-1"
                                >
                                    <FiUsers size={14} />
                                    <span className="hidden sm:inline">Apps</span>
                                </button>
                                <button
                                    onClick={() => onPreview(listing._id)} // Open Modal
                                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/20 transition-all font-medium text-xs sm:text-sm"
                                >
                                    View
                                </button>
                                <button
                                    onClick={() => navigate(`/listings/edit/${listing._id}`)}
                                    className="p-1.5 sm:p-2 bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/20 transition-all"
                                    title="Edit Listing"
                                >
                                    <FiEdit size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DashboardListings;
