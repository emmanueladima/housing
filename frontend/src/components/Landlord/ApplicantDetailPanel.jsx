import React from 'react';
import { FiX, FiMail, FiPhone, FiCalendar, FiHome, FiCheck, FiXCircle, FiMessageSquare, FiUser, FiBook } from 'react-icons/fi';

const ApplicantDetailPanel = ({ application, onClose, onStatusUpdate }) => {
    if (!application) return null;

    const applicant = application.userId || {};
    const listing = application.listingId || {};

    const handleApprove = async () => {
        if (onStatusUpdate) {
            await onStatusUpdate(application._id, 'approved');
        }
    };

    const handleReject = async () => {
        if (onStatusUpdate) {
            await onStatusUpdate(application._id, 'rejected');
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border-l border-white/10 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header - Fixed */}
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 flex-shrink-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-white/80 text-sm font-medium">Application Details</p>
                            <h2 className="text-2xl font-black text-white mt-1">
                                {applicant.firstName || 'Unknown'} {applicant.lastName || 'Applicant'}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                        >
                            <FiX size={20} />
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {/* Applicant Profile Card */}
                    <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-lg font-bold shadow-lg flex-shrink-0">
                                {applicant.profilePicture ? (
                                    <img src={applicant.profilePicture} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <span>{applicant.firstName?.[0] || '?'}{applicant.lastName?.[0] || ''}</span>
                                )}
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-white font-bold text-base truncate">
                                    {applicant.firstName} {applicant.lastName}
                                </h3>
                                <p className="text-white/60 text-sm truncate">
                                    {applicant.school ? `${applicant.school} • ${applicant.graduationYear}` : 'Student'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-white/80">
                                <FiMail className="text-orange-400 flex-shrink-0" size={14} />
                                <span className="truncate">{applicant.email || 'No email'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/80">
                                <FiPhone className="text-orange-400 flex-shrink-0" size={14} />
                                <span>{applicant.phone || 'No phone'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Property Applied For */}
                    <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                        <h4 className="text-white/60 text-xs uppercase tracking-wider mb-2">Property Applied For</h4>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {listing.images?.[0] ? (
                                    <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                                ) : (
                                    <FiHome className="text-white/50" size={18} />
                                )}
                            </div>
                            <div className="min-w-0">
                                <h4 className="text-white font-bold text-sm truncate">{listing.title || 'Unknown Listing'}</h4>
                                {listing.city && (
                                    <p className="text-white/60 text-xs truncate">{listing.city}, {listing.state} • ${listing.rent}/mo</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Timeline - Compact */}
                    <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                        <h4 className="text-white/60 text-xs uppercase tracking-wider mb-2">Details</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-white/50 text-xs">Applied</span>
                                <p className="text-white font-medium">
                                    {application.createdAt
                                        ? new Date(application.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                        : 'N/A'
                                    }
                                </p>
                            </div>
                            <div>
                                <span className="text-white/50 text-xs">Status</span>
                                <p className={`font-bold capitalize ${application.status === 'approved' ? 'text-green-400' :
                                        application.status === 'rejected' ? 'text-red-400' :
                                            'text-blue-400'
                                    }`}>
                                    {application.status?.replace('_', ' ') || 'Pending'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sticky Footer - Action Buttons */}
                <div className="flex-shrink-0 p-4 bg-gray-900/90 border-t border-white/10 space-y-2">
                    {application.status !== 'approved' && application.status !== 'rejected' && (
                        <div className="flex gap-2">
                            <button
                                onClick={handleApprove}
                                className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-green-500/20"
                            >
                                <FiCheck size={18} />
                                Approve
                            </button>
                            <button
                                onClick={handleReject}
                                className="flex-1 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors border border-red-500/30"
                            >
                                <FiXCircle size={18} />
                                Reject
                            </button>
                        </div>
                    )}
                    <button
                        className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors border border-white/20"
                    >
                        <FiMessageSquare size={18} />
                        Message Applicant
                    </button>
                </div>
            </div>
        </>
    );
};

export default ApplicantDetailPanel;
