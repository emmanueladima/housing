import React from 'react';
import { FiX, FiMail, FiPhone, FiCalendar, FiHome, FiCheck, FiXCircle, FiMessageSquare, FiUser, FiBook, FiMapPin } from 'react-icons/fi';

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl max-h-[90vh] bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                {/* Pill Handle */}
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-12 h-1.5 bg-white/30 rounded-full" />
                </div>

                {/* Header */}
                <div className="px-8 pb-6 pt-4 border-b border-white/10">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-orange-400 text-sm font-semibold uppercase tracking-wider">Application Details</p>
                            <h2 className="text-3xl font-black text-white mt-1">
                                {applicant.firstName || 'Unknown'} {applicant.lastName || 'Applicant'}
                            </h2>
                            <p className="text-white/60 mt-1">
                                {applicant.school ? `${applicant.school} • Class of ${applicant.graduationYear}` : 'Student Applicant'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                        >
                            <FiX size={24} />
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-8 py-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Left Column - Applicant Info */}
                        <div className="space-y-6">
                            {/* Profile Card */}
                            <div className="bg-white/10 rounded-2xl p-6 border border-white/10">
                                <div className="flex items-center gap-4 mb-5">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                        {applicant.profilePicture ? (
                                            <img src={applicant.profilePicture} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <span>{applicant.firstName?.[0] || '?'}{applicant.lastName?.[0] || ''}</span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-xl">
                                            {applicant.firstName} {applicant.lastName}
                                        </h3>
                                        <span className={`inline-block mt-1 text-sm font-bold capitalize px-3 py-1 rounded-full ${application.status === 'approved' ? 'bg-green-500/20 text-green-300' :
                                                application.status === 'rejected' ? 'bg-red-500/20 text-red-300' :
                                                    'bg-blue-500/20 text-blue-300'
                                            }`}>
                                            {application.status?.replace('_', ' ') || 'Pending Review'}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-white/80">
                                        <FiMail className="text-orange-400" size={18} />
                                        <span>{applicant.email || 'No email provided'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-white/80">
                                        <FiPhone className="text-orange-400" size={18} />
                                        <span>{applicant.phone || 'No phone provided'}</span>
                                    </div>
                                    {applicant.school && (
                                        <div className="flex items-center gap-3 text-white/80">
                                            <FiBook className="text-orange-400" size={18} />
                                            <span>{applicant.school}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="bg-white/10 rounded-2xl p-6 border border-white/10">
                                <h4 className="text-white/60 text-xs uppercase tracking-wider mb-4 font-semibold">Application Timeline</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-white/80">
                                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                                <FiCalendar className="text-blue-400" size={16} />
                                            </div>
                                            <span>Applied</span>
                                        </div>
                                        <span className="text-white font-medium">
                                            {application.createdAt
                                                ? new Date(application.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                                                : 'N/A'
                                            }
                                        </span>
                                    </div>
                                    {application.desiredMoveIn && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 text-white/80">
                                                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                                    <FiHome className="text-green-400" size={16} />
                                                </div>
                                                <span>Desired Move-in</span>
                                            </div>
                                            <span className="text-white font-medium">
                                                {new Date(application.desiredMoveIn).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Property Info */}
                        <div className="space-y-6">
                            {/* Property Applied For */}
                            <div className="bg-white/10 rounded-2xl p-6 border border-white/10">
                                <h4 className="text-white/60 text-xs uppercase tracking-wider mb-4 font-semibold">Property Applied For</h4>
                                <div className="space-y-4">
                                    {listing.images?.[0] && (
                                        <div className="w-full h-32 rounded-xl overflow-hidden">
                                            <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div>
                                        <h4 className="text-white font-bold text-lg">{listing.title || 'Unknown Listing'}</h4>
                                        {listing.city && (
                                            <div className="flex items-center gap-2 text-white/60 mt-1">
                                                <FiMapPin size={14} />
                                                <span>{listing.city}, {listing.state}</span>
                                            </div>
                                        )}
                                        {listing.rent && (
                                            <p className="text-orange-400 font-bold text-xl mt-2">${listing.rent}<span className="text-white/50 text-sm font-normal">/month</span></p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            {application.score && (
                                <div className="bg-white/10 rounded-2xl p-6 border border-white/10">
                                    <h4 className="text-white/60 text-xs uppercase tracking-wider mb-4 font-semibold">Match Score</h4>
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                                            <span className="text-white font-black text-xl">{application.score.total || 0}</span>
                                        </div>
                                        <div className="text-white/70 text-sm">
                                            Based on profile completeness and requirements match
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer - Action Buttons */}
                <div className="px-8 py-5 bg-gray-900/80 border-t border-white/10">
                    <div className="flex gap-3">
                        {application.status !== 'approved' && application.status !== 'rejected' ? (
                            <>
                                <button
                                    onClick={handleApprove}
                                    className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-green-500/20"
                                >
                                    <FiCheck size={20} />
                                    Approve Application
                                </button>
                                <button
                                    onClick={handleReject}
                                    className="flex-1 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors border border-red-500/30"
                                >
                                    <FiXCircle size={20} />
                                    Reject
                                </button>
                            </>
                        ) : (
                            <div className="flex-1 text-center text-white/50">
                                Application has been {application.status}
                            </div>
                        )}
                        <button
                            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors border border-white/20"
                        >
                            <FiMessageSquare size={20} />
                            Message
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicantDetailPanel;
