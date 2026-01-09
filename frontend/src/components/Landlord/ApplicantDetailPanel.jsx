import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
    FiX, FiMail, FiPhone, FiCalendar, FiHome, FiCheck, FiXCircle,
    FiMessageSquare, FiBook, FiMapPin, FiClock, FiEdit3, FiVideo,
    FiFileText, FiChevronDown, FiChevronUp
} from 'react-icons/fi';
import applicationService from '../../services/applicationService';

const ApplicantDetailPanel = ({ application, onClose, onStatusUpdate }) => {
    const navigate = useNavigate();
    const [showScheduler, setShowScheduler] = useState(false);
    const [showNotes, setShowNotes] = useState(false);
    const [tourDate, setTourDate] = useState('');
    const [tourTime, setTourTime] = useState('');
    const [tourType, setTourType] = useState('in-person');
    const [notes, setNotes] = useState(application?.landlordNotes || '');
    const [saving, setSaving] = useState(false);

    if (!application) return null;

    const applicant = application.userId || {};
    const listing = application.listingId || {};

    const handleStatusChange = async (newStatus) => {
        if (onStatusUpdate) {
            await onStatusUpdate(application._id, newStatus);
        }
    };

    const handleScheduleTour = async () => {
        if (!tourDate || !tourTime) return;
        setSaving(true);
        try {
            await applicationService.scheduleTour(application._id, {
                date: tourDate,
                time: tourTime,
                location: tourType === 'virtual' ? 'Virtual' : listing.address || listing.title,
                meetingLink: tourType === 'virtual' ? 'TBD' : null,
            });
            // Update status to interview_scheduled
            await handleStatusChange('interview_scheduled');
            setShowScheduler(false);
        } catch (error) {
            console.error('Error scheduling tour:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveNotes = async () => {
        setSaving(true);
        try {
            await applicationService.updateApplicationStatus(application._id, {
                landlordNotes: notes
            });
            setShowNotes(false);
        } catch (error) {
            console.error('Error saving notes:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleMessage = () => {
        // Navigate to messages with the applicant
        navigate(`/messages?user=${applicant._id}`);
        onClose();
    };

    const getStatusConfig = (status) => {
        const configs = {
            submitted: { color: 'bg-blue-500/30 text-blue-300 border-blue-500/30', label: 'Pending Review', icon: FiClock },
            under_review: { color: 'bg-yellow-500/30 text-yellow-300 border-yellow-500/30', label: 'Under Review', icon: FiFileText },
            interview_scheduled: { color: 'bg-purple-500/30 text-purple-300 border-purple-500/30', label: 'Tour Scheduled', icon: FiCalendar },
            approved: { color: 'bg-green-500/30 text-green-300 border-green-500/30', label: 'Approved', icon: FiCheck },
            rejected: { color: 'bg-red-500/30 text-red-300 border-red-500/30', label: 'Rejected', icon: FiXCircle },
            withdrawn: { color: 'bg-gray-500/30 text-gray-300 border-gray-500/30', label: 'Withdrawn', icon: FiXCircle },
        };
        return configs[status] || configs.submitted;
    };

    const statusConfig = getStatusConfig(application.status);
    const StatusIcon = statusConfig.icon;
    const isActionable = ['submitted', 'under_review', 'interview_scheduled'].includes(application.status);

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Glass Modal Card */}
            <div className="relative w-full max-w-3xl max-h-[90vh] bg-white/20 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
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
                            <div className="flex items-center gap-3 mt-2">
                                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${statusConfig.color}`}>
                                    <StatusIcon size={12} />
                                    {statusConfig.label}
                                </span>
                                <span className="text-white/50 text-sm">
                                    {applicant.school ? `${applicant.school} • ${applicant.graduationYear}` : 'Student'}
                                </span>
                            </div>
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
                        {/* Left Column */}
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
                                        <h3 className="text-white font-bold text-lg">{applicant.firstName} {applicant.lastName}</h3>
                                        <button
                                            onClick={handleMessage}
                                            className="mt-1 text-sm text-orange-400 hover:text-orange-300 flex items-center gap-1"
                                        >
                                            <FiMessageSquare size={14} />
                                            Send Message
                                        </button>
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
                                <h4 className="text-white/50 text-xs uppercase tracking-wider mb-4 font-semibold">Timeline</h4>
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
                                                ? new Date(application.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                                : 'N/A'
                                            }
                                        </span>
                                    </div>
                                    {application.moveInDate && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2.5 text-white/80">
                                                <div className="w-7 h-7 rounded-full bg-green-500/20 flex items-center justify-center">
                                                    <FiHome className="text-green-400" size={14} />
                                                </div>
                                                <span className="text-sm">Wants to move in</span>
                                            </div>
                                            <span className="text-white text-sm font-medium">
                                                {new Date(application.moveInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                    )}
                                    {application.tourScheduled?.date && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2.5 text-white/80">
                                                <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center">
                                                    <FiVideo className="text-purple-400" size={14} />
                                                </div>
                                                <span className="text-sm">Tour scheduled</span>
                                            </div>
                                            <span className="text-white text-sm font-medium">
                                                {new Date(application.tourScheduled.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                {application.tourScheduled.time && ` at ${application.tourScheduled.time}`}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Private Notes */}
                            <div className="bg-white/10 rounded-2xl border border-white/20 overflow-hidden">
                                <button
                                    onClick={() => setShowNotes(!showNotes)}
                                    className="w-full p-4 flex items-center justify-between text-white/80 hover:bg-white/5"
                                >
                                    <div className="flex items-center gap-2">
                                        <FiEdit3 size={16} className="text-orange-400" />
                                        <span className="text-sm font-medium">Private Notes</span>
                                    </div>
                                    {showNotes ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                                </button>
                                {showNotes && (
                                    <div className="p-4 pt-0 space-y-3">
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Add private notes about this applicant..."
                                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            rows={3}
                                        />
                                        <button
                                            onClick={handleSaveNotes}
                                            disabled={saving}
                                            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-lg disabled:opacity-50"
                                        >
                                            {saving ? 'Saving...' : 'Save Notes'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-5">
                            {/* Property */}
                            <div className="bg-white/10 rounded-2xl p-5 border border-white/20">
                                <h4 className="text-white/50 text-xs uppercase tracking-wider mb-4 font-semibold">Property Applied For</h4>
                                {listing.images?.[0] && (
                                    <div className="w-full h-28 rounded-xl overflow-hidden mb-4">
                                        <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <h4 className="text-white font-bold text-lg">{listing.title || 'Unknown'}</h4>
                                {listing.city && (
                                    <div className="flex items-center gap-1.5 text-white/60 text-sm mt-1">
                                        <FiMapPin size={14} />
                                        <span>{listing.city}, {listing.state}</span>
                                    </div>
                                )}
                                {listing.rent && (
                                    <p className="text-orange-400 font-bold text-xl mt-2">
                                        ${listing.rent}<span className="text-white/40 text-sm font-normal">/mo</span>
                                    </p>
                                )}
                            </div>

                            {/* Schedule Tour Section */}
                            {isActionable && (
                                <div className="bg-white/10 rounded-2xl border border-white/20 overflow-hidden">
                                    <button
                                        onClick={() => setShowScheduler(!showScheduler)}
                                        className="w-full p-4 flex items-center justify-between text-white/80 hover:bg-white/5"
                                    >
                                        <div className="flex items-center gap-2">
                                            <FiCalendar size={16} className="text-purple-400" />
                                            <span className="text-sm font-medium">Schedule Tour / Interview</span>
                                        </div>
                                        {showScheduler ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                                    </button>
                                    {showScheduler && (
                                        <div className="p-4 pt-0 space-y-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                <input
                                                    type="date"
                                                    value={tourDate}
                                                    onChange={(e) => setTourDate(e.target.value)}
                                                    className="bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                />
                                                <input
                                                    type="time"
                                                    value={tourTime}
                                                    onChange={(e) => setTourTime(e.target.value)}
                                                    className="bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setTourType('in-person')}
                                                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tourType === 'in-person'
                                                            ? 'bg-purple-500 text-white'
                                                            : 'bg-white/10 text-white/60 hover:bg-white/20'
                                                        }`}
                                                >
                                                    In-Person
                                                </button>
                                                <button
                                                    onClick={() => setTourType('virtual')}
                                                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tourType === 'virtual'
                                                            ? 'bg-purple-500 text-white'
                                                            : 'bg-white/10 text-white/60 hover:bg-white/20'
                                                        }`}
                                                >
                                                    Virtual
                                                </button>
                                            </div>
                                            <button
                                                onClick={handleScheduleTour}
                                                disabled={!tourDate || !tourTime || saving}
                                                className="w-full py-2.5 bg-purple-500 hover:bg-purple-600 text-white text-sm font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                <FiCalendar size={16} />
                                                {saving ? 'Scheduling...' : 'Schedule Tour'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Cover Letter / Message */}
                            {(application.coverLetter || application.messageToLandlord) && (
                                <div className="bg-white/10 rounded-2xl p-5 border border-white/20">
                                    <h4 className="text-white/50 text-xs uppercase tracking-wider mb-3 font-semibold">Applicant's Message</h4>
                                    <p className="text-white/80 text-sm leading-relaxed">
                                        {application.coverLetter || application.messageToLandlord}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer - Action Buttons */}
                <div className="px-8 py-5 bg-black/20 border-t border-white/10">
                    <div className="flex gap-3">
                        {isActionable ? (
                            <>
                                {application.status === 'submitted' && (
                                    <button
                                        onClick={() => handleStatusChange('under_review')}
                                        className="flex-1 py-3 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors border border-yellow-500/30"
                                    >
                                        <FiFileText size={18} />
                                        Mark Reviewing
                                    </button>
                                )}
                                <button
                                    onClick={() => handleStatusChange('approved')}
                                    className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg"
                                >
                                    <FiCheck size={18} />
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleStatusChange('rejected')}
                                    className="py-3 px-5 bg-white/10 hover:bg-red-500/20 text-white/70 hover:text-red-300 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors border border-white/20"
                                >
                                    <FiXCircle size={18} />
                                </button>
                            </>
                        ) : (
                            <div className="flex-1 py-3 text-center text-white/50 bg-white/5 rounded-xl">
                                Application {application.status === 'approved' ? '✓ Approved' : application.status === 'rejected' ? '✗ Rejected' : application.status}
                            </div>
                        )}
                        <button
                            onClick={handleMessage}
                            className="py-3 px-5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                        >
                            <FiMessageSquare size={18} />
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
