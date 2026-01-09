import React from 'react';
import ReactDOM from 'react-dom';
import { FiX, FiMail, FiPhone, FiCalendar, FiHome, FiCheck, FiXCircle, FiMessageSquare, FiBook, FiMapPin } from 'react-icons/fi';

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

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[100]">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Slide-in Panel */}
            <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-gradient-to-br from-gray-900 to-gray-800 border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
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
                            <FiX size={22} />
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    {/* Applicant Profile Card */}
                    <div className="bg-white/10 rounded-2xl p-5 border border-white/10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-xl font-bold shadow-lg flex-shrink-0">
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
                                    {applicant.school ? `${applicant.school} • ${applicant.graduationYear}` : 'Student'}
                                </p>
                                <span className={`inline-block mt-1.5 text-xs font-bold capitalize px-2.5 py-1 rounded-full ${application.status === 'approved' ? 'bg-green-500/20 text-green-300' :
                                        application.status === 'rejected' ? 'bg-red-500/20 text-red-300' :
                                            'bg-blue-500/20 text-blue-300'
                                    }`}>
                                    {application.status?.replace('_', ' ') || 'Pending'}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2.5 border-t border-white/10 pt-4">
                            <div className="flex items-center gap-3 text-white/80">
                                <FiMail className="text-orange-400 flex-shrink-0" size={16} />
                                <span className="text-sm">{applicant.email || 'No email'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-white/80">
                                <FiPhone className="text-orange-400 flex-shrink-0" size={16} />
                                <span className="text-sm">{applicant.phone || 'No phone'}</span>
                            </div>
                            {applicant.school && (
                                <div className="flex items-center gap-3 text-white/80">
                                    <FiBook className="text-orange-400 flex-shrink-0" size={16} />
                                    <span className="text-sm">{applicant.school}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Property Applied For */}
                    <div className="bg-white/10 rounded-2xl p-5 border border-white/10">
                        <h4 className="text-white/60 text-xs uppercase tracking-wider mb-3 font-semibold">Property Applied For</h4>
                        <div className="flex items-start gap-4">
                            <div className="w-20 h-20 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {listing.images?.[0] ? (
                                    <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                                ) : (
                                    <FiHome className="text-white/50" size={28} />
                                )}
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-base">{listing.title || 'Unknown Listing'}</h4>
                                {listing.city && (
                                    <div className="flex items-center gap-1.5 text-white/60 text-sm mt-1">
                                        <FiMapPin size={12} />
                                        <span>{listing.city}, {listing.state}</span>
                                    </div>
                                )}
                                {listing.rent && (
                                    <p className="text-orange-400 font-bold text-lg mt-2">
                                        ${listing.rent}<span className="text-white/40 text-sm font-normal">/mo</span>
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white/10 rounded-2xl p-5 border border-white/10">
                        <h4 className="text-white/60 text-xs uppercase tracking-wider mb-3 font-semibold">Timeline</h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5 text-white/80">
                                    <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center">
                                        <FiCalendar className="text-blue-400" size={14} />
                                    </div>
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
                                    <div className="flex items-center gap-2.5 text-white/80">
                                        <div className="w-7 h-7 rounded-full bg-green-500/20 flex items-center justify-center">
                                            <FiHome className="text-green-400" size={14} />
                                        </div>
                                        <span className="text-sm">Move-in</span>
                                    </div>
                                    <span className="text-white text-sm font-medium">
                                        {new Date(application.desiredMoveIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sticky Footer - Actions */}
                <div className="flex-shrink-0 p-5 bg-gray-900/95 border-t border-white/10 space-y-3">
                    {application.status !== 'approved' && application.status !== 'rejected' && (
                        <div className="flex gap-3">
                            <button
                                onClick={handleApprove}
                                className="flex-1 py-3.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg"
                            >
                                <FiCheck size={20} />
                                Approve
                            </button>
                            <button
                                onClick={handleReject}
                                className="flex-1 py-3.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors border border-red-500/30"
                            >
                                <FiXCircle size={20} />
                                Reject
                            </button>
                        </div>
                    )}
                    <button
                        className="w-full py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors border border-white/20"
                    >
                        <FiMessageSquare size={20} />
                        Message Applicant
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ApplicantDetailPanel;
