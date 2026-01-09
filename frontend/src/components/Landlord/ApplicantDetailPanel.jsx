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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Glass Modal Card */}
            <div className="relative w-full max-w-2xl max-h-[90vh] bg-white/20 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                {/* Pill Handle */}
                <div className="flex justify-center pt-4 pb-2">
                    <div className="w-12 h-1.5 bg-white/40 rounded-full" />
                </div>

                {/* Header */}
                <div className="px-8 pb-5 pt-2">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-orange-300 text-sm font-semibold uppercase tracking-wider">Application Details</p>
                            <h2 className="text-3xl font-black text-white mt-1">
                                {applicant.firstName || 'Unknown'} {applicant.lastName || 'Applicant'}
                            </h2>
                            <p className="text-white/60 mt-1">
                                {applicant.school ? `${applicant.school} • Class of ${applicant.graduationYear}` : 'Student Applicant'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                        >
                            <FiX size={22} />
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-8 pb-6">
                    <div className="grid md:grid-cols-2 gap-5">
                        {/* Left Column - Applicant Info */}
                        <div className="space-y-5">
                            {/* Profile Card */}
                            <div className="bg-white/10 rounded-2xl p-5 border border-white/20">
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
                                        <span className={`inline-block mt-1 text-xs font-bold capitalize px-2.5 py-1 rounded-full ${application.status === 'approved' ? 'bg-green-500/30 text-green-300 border border-green-500/30' :
                                                application.status === 'rejected' ? 'bg-red-500/30 text-red-300 border border-red-500/30' :
                                                    'bg-blue-500/30 text-blue-300 border border-blue-500/30'
                                            }`}>
                                            {application.status?.replace('_', ' ') || 'Pending Review'}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2.5 border-t border-white/10 pt-4">
                                    <div className="flex items-center gap-3 text-white/80">
                                        <FiMail className="text-orange-400" size={16} />
                                        <span className="text-sm">{applicant.email || 'No email'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-white/80">
                                        <FiPhone className="text-orange-400" size={16} />
                                        <span className="text-sm">{applicant.phone || 'No phone'}</span>
                                    </div>
                                    {applicant.school && (
                                        <div className="flex items-center gap-3 text-white/80">
                                            <FiBook className="text-orange-400" size={16} />
                                            <span className="text-sm">{applicant.school}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="bg-white/10 rounded-2xl p-5 border border-white/20">
                                <h4 className="text-white/50 text-xs uppercase tracking-wider mb-4 font-semibold">Application Timeline</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-white/80">
                                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
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
                                            <div className="flex items-center gap-3 text-white/80">
                                                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                                    <FiHome className="text-green-400" size={14} />
                                                </div>
                                                <span className="text-sm">Move-in Date</span>
                                            </div>
                                            <span className="text-white text-sm font-medium">
                                                {new Date(application.desiredMoveIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Property Info */}
                        <div className="space-y-5">
                            {/* Property */}
                            <div className="bg-white/10 rounded-2xl p-5 border border-white/20">
                                <h4 className="text-white/50 text-xs uppercase tracking-wider mb-4 font-semibold">Property Applied For</h4>
                                {listing.images?.[0] && (
                                    <div className="w-full h-32 rounded-xl overflow-hidden mb-4">
                                        <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div>
                                    <h4 className="text-white font-bold text-lg">{listing.title || 'Unknown Listing'}</h4>
                                    {listing.city && (
                                        <div className="flex items-center gap-1.5 text-white/60 text-sm mt-1">
                                            <FiMapPin size={14} />
                                            <span>{listing.city}, {listing.state}</span>
                                        </div>
                                    )}
                                    {listing.rent && (
                                        <p className="text-orange-400 font-bold text-2xl mt-3">
                                            ${listing.rent}<span className="text-white/40 text-sm font-normal">/month</span>
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Match Score (if available) */}
                            {application.score?.total && (
                                <div className="bg-white/10 rounded-2xl p-5 border border-white/20">
                                    <h4 className="text-white/50 text-xs uppercase tracking-wider mb-3 font-semibold">Match Score</h4>
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                                            <span className="text-white font-black text-xl">{application.score.total}</span>
                                        </div>
                                        <p className="text-white/60 text-sm">Based on profile match</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer - Action Buttons */}
                <div className="px-8 py-5 bg-black/20 border-t border-white/10">
                    <div className="flex gap-3">
                        {application.status !== 'approved' && application.status !== 'rejected' ? (
                            <>
                                <button
                                    onClick={handleApprove}
                                    className="flex-1 py-3.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg"
                                >
                                    <FiCheck size={20} />
                                    Approve Application
                                </button>
                                <button
                                    onClick={handleReject}
                                    className="flex-1 py-3.5 bg-white/10 hover:bg-red-500/20 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors border border-white/20"
                                >
                                    <FiXCircle size={20} />
                                    Reject
                                </button>
                            </>
                        ) : (
                            <div className="flex-1 py-3.5 text-center text-white/50 bg-white/5 rounded-xl">
                                Application {application.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
                            </div>
                        )}
                        <button
                            className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors border border-white/20"
                        >
                            <FiMessageSquare size={20} />
                            Message
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ApplicantDetailPanel;
