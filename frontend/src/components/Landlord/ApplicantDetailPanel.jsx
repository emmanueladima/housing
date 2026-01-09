import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
    FiX, FiMail, FiPhone, FiCalendar, FiHome, FiCheck, FiXCircle,
    FiMessageSquare, FiBook, FiMapPin, FiClock, FiEdit3
} from 'react-icons/fi';
import applicationService from '../../services/applicationService';

const ApplicantDetailPanel = ({ application, onClose, onStatusUpdate }) => {
    const navigate = useNavigate();
    const [tourDate, setTourDate] = useState('');
    const [tourTime, setTourTime] = useState('');
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
                location: listing.address || listing.title,
            });
            await handleStatusChange('interview_scheduled');
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
        } catch (error) {
            console.error('Error saving notes:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleMessage = () => {
        navigate(`/messages?user=${applicant._id}`);
        onClose();
    };

    const getStatusBadge = (status) => {
        const configs = {
            submitted: { color: 'bg-blue-500/30 text-blue-300', label: 'Pending' },
            under_review: { color: 'bg-yellow-500/30 text-yellow-300', label: 'Reviewing' },
            interview_scheduled: { color: 'bg-purple-500/30 text-purple-300', label: 'Tour Scheduled' },
            approved: { color: 'bg-green-500/30 text-green-300', label: 'Approved' },
            rejected: { color: 'bg-red-500/30 text-red-300', label: 'Rejected' },
        };
        const config = configs[status] || configs.submitted;
        return <span className={`text-xs font-bold px-3 py-1 rounded-full ${config.color}`}>{config.label}</span>;
    };

    const isActionable = ['submitted', 'under_review', 'interview_scheduled'].includes(application.status);

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-lg max-h-[85vh] bg-white/20 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl overflow-hidden flex flex-col">
                {/* Pill Handle */}
                <div className="flex justify-center pt-4 pb-2">
                    <div className="w-12 h-1.5 bg-white/40 rounded-full" />
                </div>

                {/* Header */}
                <div className="px-6 pb-4 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-black text-white">
                            {applicant.firstName} {applicant.lastName}
                        </h2>
                        <div className="flex items-center gap-2 mt-1.5">
                            {getStatusBadge(application.status)}
                            <span className="text-white/50 text-sm">{applicant.school} • {applicant.graduationYear}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white">
                        <FiX size={20} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-4">

                    {/* === APPLICANT SECTION === */}
                    <div className="bg-white/10 rounded-2xl p-5 border border-white/20 space-y-4">
                        {/* Profile Row */}
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-lg font-bold">
                                {applicant.firstName?.[0]}{applicant.lastName?.[0]}
                            </div>
                            <div className="flex-1">
                                <div className="text-white font-bold">{applicant.firstName} {applicant.lastName}</div>
                                <div className="text-white/60 text-sm">{applicant.email}</div>
                            </div>
                            <button onClick={handleMessage} className="px-3 py-1.5 bg-orange-500/20 text-orange-300 text-sm font-medium rounded-lg flex items-center gap-1.5 hover:bg-orange-500/30">
                                <FiMessageSquare size={14} />
                                Message
                            </button>
                        </div>

                        {/* Contact Info */}
                        <div className="flex flex-wrap gap-4 text-sm text-white/70 border-t border-white/10 pt-4">
                            <div className="flex items-center gap-2">
                                <FiPhone className="text-orange-400" size={14} />
                                {applicant.phone || 'No phone'}
                            </div>
                            <div className="flex items-center gap-2">
                                <FiBook className="text-orange-400" size={14} />
                                {applicant.school}
                            </div>
                            <div className="flex items-center gap-2">
                                <FiCalendar className="text-orange-400" size={14} />
                                Applied {new Date(application.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                        </div>
                    </div>

                    {/* Property + Message */}
                    <div className="bg-white/10 rounded-2xl p-5 border border-white/20">
                        <div className="flex gap-4">
                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/10 flex-shrink-0">
                                {listing.images?.[0] ? (
                                    <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center"><FiHome className="text-white/30" size={24} /></div>
                                )}
                            </div>
                            <div>
                                <div className="text-xs text-white/50 uppercase tracking-wider mb-1">Applied For</div>
                                <div className="text-white font-bold">{listing.title}</div>
                                <div className="text-white/60 text-sm flex items-center gap-1 mt-0.5">
                                    <FiMapPin size={12} /> {listing.city}, {listing.state}
                                </div>
                                <div className="text-orange-400 font-bold mt-1">${listing.rent}/mo</div>
                            </div>
                        </div>
                        {(application.coverLetter || application.messageToLandlord) && (
                            <div className="mt-4 pt-4 border-t border-white/10">
                                <div className="text-xs text-white/50 uppercase tracking-wider mb-2">Their Message</div>
                                <p className="text-white/80 text-sm">{application.coverLetter || application.messageToLandlord}</p>
                            </div>
                        )}
                    </div>

                    {/* === LANDLORD CONTROLS SECTION === */}
                    {isActionable && (
                        <div className="bg-white/5 rounded-2xl p-5 border border-white/10 space-y-4">
                            <div className="text-xs text-white/40 uppercase tracking-wider font-semibold">Landlord Actions</div>

                            {/* Schedule Tour */}
                            <div>
                                <div className="text-white/70 text-sm mb-2 flex items-center gap-2">
                                    <FiCalendar size={14} className="text-purple-400" />
                                    Schedule Tour
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="date"
                                        value={tourDate}
                                        onChange={(e) => setTourDate(e.target.value)}
                                        className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                                    />
                                    <input
                                        type="time"
                                        value={tourTime}
                                        onChange={(e) => setTourTime(e.target.value)}
                                        className="w-28 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                                    />
                                    <button
                                        onClick={handleScheduleTour}
                                        disabled={!tourDate || !tourTime || saving}
                                        className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-bold rounded-lg disabled:opacity-50"
                                    >
                                        Set
                                    </button>
                                </div>
                            </div>

                            {/* Private Notes */}
                            <div>
                                <div className="text-white/70 text-sm mb-2 flex items-center gap-2">
                                    <FiEdit3 size={14} className="text-blue-400" />
                                    Private Notes
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Add a note..."
                                        className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                    <button
                                        onClick={handleSaveNotes}
                                        disabled={saving}
                                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-lg disabled:opacity-50"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 bg-black/20 border-t border-white/10 flex gap-3">
                    {isActionable ? (
                        <>
                            <button
                                onClick={() => handleStatusChange('approved')}
                                className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                            >
                                <FiCheck size={18} />
                                Approve
                            </button>
                            <button
                                onClick={() => handleStatusChange('rejected')}
                                className="py-3 px-4 bg-white/10 hover:bg-red-500/20 text-white/60 hover:text-red-300 font-bold rounded-xl"
                            >
                                <FiXCircle size={18} />
                            </button>
                            <button
                                onClick={handleMessage}
                                className="py-3 px-5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl flex items-center gap-2"
                            >
                                <FiMessageSquare size={18} />
                                Message
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="flex-1 py-3 text-center text-white/50 bg-white/5 rounded-xl">
                                {application.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
                            </div>
                            <button
                                onClick={handleMessage}
                                className="py-3 px-5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl flex items-center gap-2"
                            >
                                <FiMessageSquare size={18} />
                                Message
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ApplicantDetailPanel;
