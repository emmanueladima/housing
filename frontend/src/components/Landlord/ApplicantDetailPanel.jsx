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
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border-l border-white/10 shadow-2xl z-50 overflow-y-auto animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 p-6 z-10">
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

                <div className="p-6 space-y-6">
                    {/* Applicant Profile Card */}
                    <div className="bg-white/10 rounded-2xl p-5 border border-white/10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                                {applicant.profilePicture ? (
                                    <img src={applicant.profilePicture} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <span>{applicant.firstName?.[0] || '?'}{applicant.lastName?.[0] || ''}</span>
                                )}
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg">
                                    {applicant.firstName} {applicant.lastName}
                                </h3>
                                <p className="text-white/60 text-sm">
                                    {applicant.school ? `${applicant.school} • Class of ${applicant.graduationYear}` : 'Student'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-white/80">
                                <FiMail className="text-orange-400" size={16} />
                                <span className="text-sm">{applicant.email || 'No email provided'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-white/80">
                                <FiPhone className="text-orange-400" size={16} />
                                <span className="text-sm">{applicant.phone || 'No phone provided'}</span>
                            </div>
                            {applicant.school && (
                                <div className="flex items-center gap-3 text-white/80">
                                    <FiBook className="text-orange-400" size={16} />
                                    <span className="text-sm">{applicant.school}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Property Applied For */}
                    <div className="bg-white/10 rounded-2xl p-5 border border-white/10">
                        <h4 className="text-white/60 text-xs uppercase tracking-wider mb-3">Property Applied For</h4>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden">
                                {listing.images?.[0] ? (
                                    <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                                ) : (
                                    <FiHome className="text-white/50" size={20} />
                                )}
                            </div>
                            <div>
                                <h4 className="text-white font-bold">{listing.title || 'Unknown Listing'}</h4>
                                {listing.city && (
                                    <p className="text-white/60 text-sm">{listing.city}, {listing.state} • ${listing.rent}/mo</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Application Timeline */}
                    <div className="bg-white/10 rounded-2xl p-5 border border-white/10">
                        <h4 className="text-white/60 text-xs uppercase tracking-wider mb-3">Timeline</h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-white/80">
                                    <FiCalendar className="text-blue-400" size={14} />
                                    <span className="text-sm">Applied</span>
                                </div>
                                <span className="text-white text-sm font-medium">
                                    {application.createdAt
                                        ? new Date(application.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                        : 'N/A'
                                    }
                                </span>
                            </div>
                            {application.desiredMoveIn && (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-white/80">
                                        <FiHome className="text-green-400" size={14} />
                                        <span className="text-sm">Desired Move-in</span>
                                    </div>
                                    <span className="text-white text-sm font-medium">
                                        {new Date(application.desiredMoveIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-white/80">
                                    <FiUser className="text-purple-400" size={14} />
                                    <span className="text-sm">Status</span>
                                </div>
                                <span className={`text-sm font-bold capitalize px-2 py-0.5 rounded-full ${application.status === 'approved' ? 'bg-green-500/20 text-green-300' :
                                        application.status === 'rejected' ? 'bg-red-500/20 text-red-300' :
                                            'bg-blue-500/20 text-blue-300'
                                    }`}>
                                    {application.status?.replace('_', ' ') || 'Pending'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 pt-4">
                        {application.status !== 'approved' && application.status !== 'rejected' && (
                            <>
                                <button
                                    onClick={handleApprove}
                                    className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-green-500/20"
                                >
                                    <FiCheck size={18} />
                                    Approve Application
                                </button>
                                <button
                                    onClick={handleReject}
                                    className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors border border-red-500/30"
                                >
                                    <FiXCircle size={18} />
                                    Reject Application
                                </button>
                            </>
                        )}
                        <button
                            className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors border border-white/20"
                        >
                            <FiMessageSquare size={18} />
                            Message Applicant
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ApplicantDetailPanel;
